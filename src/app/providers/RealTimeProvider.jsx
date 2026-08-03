import React, { createContext, useContext, useEffect, useRef, useState, useCallback, useMemo } from 'react'
import { Client } from '@stomp/stompjs'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { queryKeys } from '@/shared/api/queryKeys'
import { useAuth } from '@/identity'

const RealtimeContext = createContext({
  connected: false,
  subscribeToTask: () => () => {},
  subscribeToTopic: () => () => {},
  publish: () => {},
})

export const useRealtime = () => useContext(RealtimeContext)

export function RealtimeProvider({ children }) {
  const { user } = useAuth()
  const clientRef = useRef(null)
  const [connected, setConnected] = useState(false)
  const queryClient = useQueryClient()

  // Track dynamic subscriptions so they can queue while disconnected and resubscribe automatically
  const pendingSubscriptions = useRef(new Map())
  const activeSubscriptions = useRef(new Map())
  const subCounter = useRef(0)

  const connect = useCallback(() => {
    const token = localStorage.getItem('jwt_token')
    if (!token || clientRef.current?.active) return

    // Derive WS URL from the API base: http://localhost:8080/api → ws://localhost:8080/ws
    const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1'
    const wsUrl = apiBase.replace(/\/api(\/v1)?\/?$/, '').replace(/^http/i, 'ws') + '/ws'

    const client = new Client({
      brokerURL: wsUrl,
      connectHeaders: { Authorization: `Bearer ${token}` },
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      reconnectDelay: 5000,
      beforeConnect: () => {
        const freshToken = localStorage.getItem('jwt_token')
        if (freshToken) client.connectHeaders = { Authorization: 'Bearer ' + freshToken }
      },
      onConnect: () => {
        setConnected(true)

        // Personal notifications
        client.subscribe('/user/queue/notifications', (msg) => {
          const n = JSON.parse(msg.body)
          queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all })
          queryClient.invalidateQueries({ queryKey: queryKeys.notifications.unreadCount() })
          if (n.title) {
            toast(n.title, { description: n.message })
          }
        })

        // Unread count pushes
        client.subscribe('/user/queue/unread-count', (msg) => {
          const count = Number(msg.body)
          if (!isNaN(count)) {
            queryClient.setQueryData(queryKeys.notifications.unreadCount(), count)
          }
        })

        // Workspace mode sync
        client.subscribe('/user/queue/workspace-mode', (msg) => {
          queryClient.setQueryData(queryKeys.workspace.mode(), msg.body)
        })

        // Force disconnect (admin revoke, password change, logout from another device)
        client.subscribe('/user/queue/force-disconnect', () => {
          localStorage.removeItem('jwt_token')
          localStorage.removeItem('jwt_refresh')
          toast.warning('Your session was terminated from another device')
          window.location.href = '/login'
        })

        // Handle subscription errors
        client.subscribe('/user/queue/errors', (msg) => {
          const errorMsg = msg.body
          if (import.meta.env.DEV) {
            console.warn('[RealtimeProvider] WS Error:', errorMsg)
          }
          if (errorMsg.startsWith('Subscription denied: ')) {
            const topic = errorMsg.replace('Subscription denied: ', '')
            for (const [id, req] of pendingSubscriptions.current.entries()) {
              if (req.topic === topic) {
                pendingSubscriptions.current.delete(id)
                const activeSub = activeSubscriptions.current.get(id)
                if (activeSub) {
                  // activeSub might just be a mock or invalid, but we clean it up anyway
                  try { activeSub.unsubscribe() } catch { /* ignore */ }
                  activeSubscriptions.current.delete(id)
                }
              }
            }
          }
        })

        // Apply any dynamic subscriptions that were queued before we connected
        for (const [id, req] of pendingSubscriptions.current.entries()) {
          if (!activeSubscriptions.current.has(id)) {
            const sub = client.subscribe(req.topic, (msg) => {
              try { req.onUpdate(JSON.parse(msg.body)) } catch { /* ignore */ }
            })
            activeSubscriptions.current.set(id, sub)
          }
        }
      },
      onDisconnect: () => {
        setConnected(false)
        activeSubscriptions.current.forEach((sub) => {
          try {
            sub.unsubscribe()
          } catch { /* ignore */ }
        })
        activeSubscriptions.current.clear() // Force recreation on next connect
      },
      onStompError: (frame) => {
        const msg = frame.headers?.['message'] || 'STOMP session closed'
        if (import.meta.env.DEV) {
          console.warn('[RealtimeProvider] STOMP notice:', msg)
        }
      },
    })

    clientRef.current = client
    client.activate()
  }, [queryClient])

  useEffect(() => {
    if (user) connect()
    return () => {
      clientRef.current?.deactivate()
      clientRef.current = null
    }
  }, [connect, user])

  // Generic subscribe to any topic
  const subscribeToTopic = useCallback((topic, onUpdate) => {
    if (!topic) return () => {}
    
    const id = String(subCounter.current++)
    pendingSubscriptions.current.set(id, { topic, onUpdate })
    
    // If already connected, apply immediately
    if (clientRef.current?.connected) {
      const sub = clientRef.current.subscribe(topic, (msg) => {
        try {
          onUpdate(JSON.parse(msg.body))
        } catch { /* ignore */ }
      })
      activeSubscriptions.current.set(id, sub)
    }
    
    return () => {
      pendingSubscriptions.current.delete(id)
      const activeSub = activeSubscriptions.current.get(id)
      if (activeSub) {
        activeSub.unsubscribe()
        activeSubscriptions.current.delete(id)
      }
    }
  }, [])

  // Subscribe to a specific task's updates (for live-editing in TaskPanel)
  const subscribeToTask = useCallback((taskId, onUpdate) => {
    return subscribeToTopic(taskId ? `/topic/tasks/${taskId}` : null, (dto) => {
      import('@/task/entities/model/normalizer').then(({ normalizeTask }) => {
        onUpdate(normalizeTask(dto));
      });
    })
  }, [subscribeToTopic])

  // Generic publish method
  const publish = useCallback((destination, body) => {
    if (clientRef.current?.connected) {
      clientRef.current.publish({ destination, body: JSON.stringify(body) })
    }
  }, [])

  const value = useMemo(
    () => ({ connected, subscribeToTask, subscribeToTopic, publish }),
    [connected, subscribeToTask, subscribeToTopic, publish]
  )

  return (
    <RealtimeContext.Provider value={value}>
      {children}
    </RealtimeContext.Provider>
  )
}

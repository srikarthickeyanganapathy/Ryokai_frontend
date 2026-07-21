import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react'
import { Client } from '@stomp/stompjs'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { queryKeys } from '@/shared/api/queryKeys'
import { useAuth } from '@/features/auth/hooks/useAuth'

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

    // Derive WS URL from the API base: http://localhost:8080/api → http://localhost:8080/ws
    const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'
    const wsUrl = apiBase.replace(/\/api\/?$/, '') + '/ws'

    const client = new Client({
      brokerURL: wsUrl,
      connectHeaders: { Authorization: `Bearer ${token}` },
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      reconnectDelay: 5000,
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

        // Force disconnect (admin revoke, password change, logout from another device)
        client.subscribe('/user/queue/force-disconnect', () => {
          localStorage.removeItem('jwt_token')
          localStorage.removeItem('jwt_refresh')
          toast.warning('Your session was terminated from another device')
          window.location.href = '/login'
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
        activeSubscriptions.current.clear() // Force recreation on next connect
      },
      onStompError: (frame) => {
        console.error('STOMP error:', frame.headers?.['message'] || frame)
      },
    })

    client.activate()
    clientRef.current = client
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
    return subscribeToTopic(taskId ? `/topic/tasks/${taskId}` : null, onUpdate)
  }, [subscribeToTopic])

  // Generic publish method
  const publish = useCallback((destination, body) => {
    if (clientRef.current?.connected) {
      clientRef.current.publish({ destination, body: JSON.stringify(body) })
    }
  }, [])

  return (
    <RealtimeContext.Provider value={{ connected, subscribeToTask, subscribeToTopic, publish }}>
      {children}
    </RealtimeContext.Provider>
  )
}

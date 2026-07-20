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
      },
      onDisconnect: () => setConnected(false),
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

  // Subscribe to a specific task's updates (for live-editing in TaskPanel)
  const subscribeToTask = useCallback((taskId, onUpdate) => {
    if (!clientRef.current?.active || !taskId) return () => {}
    const sub = clientRef.current.subscribe(`/topic/tasks/${taskId}`, (msg) => {
      try {
        onUpdate(JSON.parse(msg.body))
      } catch { /* ignore malformed messages */ }
    })
    return () => sub.unsubscribe()
  }, [])

  // Generic subscribe to any topic
  const subscribeToTopic = useCallback((topic, onUpdate) => {
    if (!clientRef.current?.active || !topic) return () => {}
    const sub = clientRef.current.subscribe(topic, (msg) => {
      try {
        onUpdate(JSON.parse(msg.body))
      } catch { /* ignore malformed messages */ }
    })
    return () => sub.unsubscribe()
  }, [])

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

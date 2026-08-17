import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * Announces route changes to screen readers via an aria-live status region.
 * Skips the initial mount so the page load is not announced as a navigation.
 */
export function RouteAnnouncer() {
  const location = useLocation()
  const [message, setMessage] = useState('')
  const firstRender = useRef(true)

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
      return
    }
    const segment = location.pathname.split('/').filter(Boolean).pop() || 'home'
    const label = segment.replace(/-/g, ' ').replace(/[^\w\s]/g, '')
    setMessage('Navigated to ' + label)
  }, [location.pathname])

  return (
    <span role="status" className="sr-only">{message}</span>
  )
}

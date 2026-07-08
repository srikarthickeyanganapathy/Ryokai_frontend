import { useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

export function useShortcuts() {
  const navigate = useNavigate()
  const location = useLocation()
  const keyBuffer = useRef('')
  const timeoutRef = useRef(null)

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't trigger if user is typing in an input, textarea, or contenteditable
      if (
        e.target.tagName === 'INPUT' ||
        e.target.tagName === 'TEXTAREA' ||
        e.target.isContentEditable
      ) {
        // Allow Esc to blur inputs
        if (e.key === 'Escape') {
          e.target.blur()
        }
        return
      }

      const key = e.key.toLowerCase()

      // Handle single-key shortcuts
      switch (key) {
        case '/':
          e.preventDefault()
          // We can dispatch a custom event to focus the global search bar
          window.dispatchEvent(new CustomEvent('focus-search'))
          return



      }


      // Handle sequence shortcuts (e.g., G then C)
      keyBuffer.current += key
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      
      // Clear buffer after 500ms
      timeoutRef.current = setTimeout(() => {
        keyBuffer.current = ''
      }, 500)

      const sequence = keyBuffer.current

      if (sequence === 'gc') {
        navigate('/app/tasks?view=calendar')
        keyBuffer.current = ''
      } else if (sequence === 'gl') {
        navigate('/app/tasks?view=list')
        keyBuffer.current = ''
      } else if (sequence === 'gb') {
        navigate('/app/tasks?view=board')
        keyBuffer.current = ''
      } else if (sequence === 'gf') {
        navigate('/app/focus')
        keyBuffer.current = ''
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [navigate, location])
}

import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUIStore } from './useUIStore';

export const useKeyboardShortcuts = () => {
  const navigate = useNavigate();
  const keysPressed = useRef(new Set());
  const timer = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore if typing in an input or textarea
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName) || e.target.isContentEditable) {
        return;
      }

      keysPressed.current.add(e.key.toLowerCase());

      // Cmd+K or Ctrl+K for Command Palette handled globally by CommandPalette component or state

      if (e.key === '/') {
        e.preventDefault();
        useUIStore.getState().setCommandPaletteOpen(true);
      }

      // Check for sequences like 'g' then 'h'
      if (keysPressed.current.has('g')) {
        if (e.key.toLowerCase() === 'h') {
          navigate('/');
          keysPressed.current.clear();
        } else if (e.key.toLowerCase() === 'b') {
          navigate('/board');
          keysPressed.current.clear();
        } else if (e.key.toLowerCase() === 't') {
          navigate('/team');
          keysPressed.current.clear();
        }
      }

      // Clear sequence after a short delay
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        keysPressed.current.clear();
      }, 500);
    };

    const handleKeyUp = (e) => {
      keysPressed.current.delete(e.key.toLowerCase());
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (timer.current) clearTimeout(timer.current);
    };
  }, [navigate]);
};

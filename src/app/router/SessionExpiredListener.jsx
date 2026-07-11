import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export function SessionExpiredListener() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleSessionExpired = () => {
      navigate('/session-expired', { replace: true });
    };

    window.addEventListener('session-expired', handleSessionExpired);
    return () => window.removeEventListener('session-expired', handleSessionExpired);
  }, [navigate]);

  return null;
}

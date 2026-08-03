import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export function SessionExpiredListener() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleSessionExpired = () => {
      navigate('/session-expired', { 
        replace: true,
        state: { returnTo: location.pathname + location.search }
      });
    };

    window.addEventListener('session-expired', handleSessionExpired);
    return () => window.removeEventListener('session-expired', handleSessionExpired);
  }, [navigate, location.pathname, location.search]);

  return null;
}

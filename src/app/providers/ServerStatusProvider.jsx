import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQueryClient } from '@tanstack/react-query';
import { CloudOff, RefreshCw } from 'lucide-react';
import api, { SERVER_UNREACHABLE_EVENT } from '@/shared/api/api';
import { Button } from '@/shared/ui/Button';
import { EASING } from '@/shared/lib/uxTokens';

const PING_INTERVAL_MS = 5000;
const PING_TIMEOUT_MS = 8000;

/**
 * Reaches the backend health endpoint with a no-cors fetch. Resolves as soon as
 * the server answers at the network level (any HTTP response — the body is
 * opaque here), independent of CORS, so it also works while the allowed-origins
 * list is still being sorted out. Rejects while the Render free instance is
 * asleep or cold-starting.
 */
const healthUrl = () => {
  const base = api.defaults.baseURL || '';
  return `${base.replace(/\/api\/v1\/?$/, '')}/actuator/health`;
};

const pingServer = async () => {
  try {
    await fetch(healthUrl(), {
      mode: 'no-cors',
      cache: 'no-store',
      signal: AbortSignal.timeout(PING_TIMEOUT_MS),
    });
    return true;
  } catch {
    return false;
  }
};

const ServerStatusContext = createContext(null);

export const useServerStatus = () => useContext(ServerStatusContext);

/**
 * Full-screen reconnect experience for the free-tier sleep/wake cycle.
 * The axios layer reports unreachable requests (no response, or 502/503/504)
 * via SERVER_UNREACHABLE_EVENT; this provider then polls the health endpoint
 * until the instance answers, and refetches all react-query data on recovery.
 */
export function ServerStatusProvider({ children }) {
  const queryClient = useQueryClient();
  const [down, setDown] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const retryRef = useRef(null);

  useEffect(() => {
    const onUnreachable = () => setDown(true);
    window.addEventListener(SERVER_UNREACHABLE_EVENT, onUnreachable);

    // On load, catch an already-sleeping server before every query fails
    // into error toasts. This ping also starts the wake-up immediately.
    pingServer().then((reachable) => {
      if (!reachable) setDown(true);
    });

    return () => window.removeEventListener(SERVER_UNREACHABLE_EVENT, onUnreachable);
  }, []);

  useEffect(() => {
    if (!down) return undefined;

    let cancelled = false;
    let timer = null;

    const attempt = async () => {
      const reachable = await pingServer();
      if (cancelled) return;
      if (reachable) {
        setDown(false);
        setAttempts(0);
        queryClient.invalidateQueries();
        return;
      }
      setAttempts((n) => n + 1);
      timer = setTimeout(attempt, PING_INTERVAL_MS);
    };

    attempt();
    retryRef.current = () => {
      if (timer) clearTimeout(timer);
      attempt();
    };

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [down, queryClient]);

  const retryNow = useCallback(() => retryRef.current?.(), []);

  return (
    <ServerStatusContext.Provider value={{ down, retryNow }}>
      {children}
      <AnimatePresence>
        {down && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: EASING.out }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-[var(--bg-base)]/95 backdrop-blur-sm"
            role="alertdialog"
            aria-live="assertive"
            aria-label="Reconnecting to the Ryokai server"
          >
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.05, ease: EASING.out }}
              className="flex flex-col items-center text-center max-w-md px-8"
            >
              <div className="w-16 h-16 rounded-2xl bg-[var(--accent-soft)] border border-[var(--accent-border)] flex items-center justify-center mb-6">
                <CloudOff className="w-7 h-7 text-[var(--accent)]" strokeWidth={1.5} />
              </div>
              <h2 className="text-lg font-semibold text-[var(--text-primary)] tracking-tight mb-2">
                Reconnecting to Ryokai
              </h2>
              <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed mb-3">
                The server is waking up — on the free plan this usually takes under
                a minute. We'll bring you back automatically.
              </p>
              <p className="text-xs text-[var(--text-tertiary)] mb-6">
                {attempts > 0 ? `Attempt ${attempts}${attempts >= 6 ? ' — still trying' : ''}` : 'Checking…'}
              </p>
              <Button variant="outline" size="sm" className="gap-1.5" onClick={retryNow}>
                <RefreshCw size={14} strokeWidth={1.5} />
                Retry now
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </ServerStatusContext.Provider>
  );
}

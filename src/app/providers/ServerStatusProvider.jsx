import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQueryClient } from '@tanstack/react-query';
import { Cloud, CloudOff, RefreshCw } from 'lucide-react';
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
  
  // UI & Game State
  const [secondsLeft, setSecondsLeft] = useState(60);
  const [gameScore, setGameScore] = useState(0);
  const [activeCell, setActiveCell] = useState(null);
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
        // Stagger re-fetches to avoid thundering herd on wake-up
        const groups = ['users', 'notifications', 'tasks', 'organizations', 'crews'];
        for (const key of groups) {
          queryClient.invalidateQueries({ queryKey: [key] });
          await new Promise(r => setTimeout(r, 500));
        }
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

  // Timers & Game Loop (Only runs when the overlay is visible)
  useEffect(() => {
    if (!down) {
      // Reset everything when server is back
      setSecondsLeft(60);
      setGameScore(0);
      setActiveCell(null);
      return undefined;
    }

    // 1. 60-second looping countdown timer
    const countdownInterval = setInterval(() => {
      setSecondsLeft((s) => (s <= 0 ? 60 : s - 1));
    }, 1000);

    // 2. Whack-a-Cloud game loop: spawn a cloud in a random cell every 800ms
    const gameSpawnInterval = setInterval(() => {
      setActiveCell(Math.floor(Math.random() * 9));
    }, 800);

    return () => {
      clearInterval(countdownInterval);
      clearInterval(gameSpawnInterval);
    };
  }, [down]);

  const retryNow = useCallback(() => retryRef.current?.(), []);

  // Game interaction handler
  const handleCloudClick = (index) => {
    if (index === activeCell) {
      setGameScore((s) => s + 1);
      setActiveCell(null); // Hide immediately, next interval will spawn a new one
    }
  };

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
              className="relative flex flex-col items-center text-center w-full max-w-sm p-6 rounded-3xl border border-[var(--accent-border)] bg-[var(--bg-elevated)] shadow-2xl"
            >
              {/* Header: Timer & Score */}
              <div className="w-full flex justify-between items-center mb-6">
                {/* Circular Countdown Timer */}
                <div className="relative w-12 h-12">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" stroke="var(--accent-soft)" strokeWidth="10" fill="none" />
                    <motion.circle
                      cx="50" cy="50" r="40"
                      stroke="var(--accent)" strokeWidth="10" fill="none" strokeLinecap="round"
                      strokeDasharray="251.33"
                      animate={{ strokeDashoffset: 251.33 - (secondsLeft / 60) * 251.33 }}
                      transition={{ duration: 1, ease: 'linear' }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-[var(--text-primary)]">
                    {secondsLeft}s
                  </div>
                </div>
                
                {/* Score Tracker */}
                <div className="text-right">
                  <p className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-wider font-medium">Score</p>
                  <p className="text-2xl font-bold text-[var(--accent)] leading-none">{gameScore}</p>
                </div>
              </div>

              <div className="w-14 h-14 rounded-2xl bg-[var(--accent-soft)] border border-[var(--accent-border)] flex items-center justify-center mb-4">
                <CloudOff className="w-6 h-6 text-[var(--accent)]" strokeWidth={1.5} />
              </div>
              
              <h2 className="text-lg font-semibold text-[var(--text-primary)] tracking-tight mb-1">
                Reconnecting to Ryokai
              </h2>
              <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed mb-5 max-w-[260px]">
                The server is waking up. Play a quick round while we wait!
              </p>

              {/* 3x3 Game Grid */}
              <div className="grid grid-cols-3 gap-2.5 w-44 h-44 mb-6">
                {[...Array(9)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => handleCloudClick(i)}
                    className="bg-[var(--bg-base)] border border-[var(--accent-border)] rounded-xl flex items-center justify-center cursor-pointer hover:border-[var(--accent)] transition-colors"
                    aria-label={`Game cell ${i + 1}`}
                  >
                    <AnimatePresence>
                      {activeCell === i && (
                        <motion.div
                          initial={{ scale: 0, y: 20, opacity: 0 }}
                          animate={{ scale: 1, y: 0, opacity: 1 }}
                          exit={{ scale: 0, y: -20, opacity: 0 }}
                          transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                        >
                          <Cloud className="w-7 h-7 text-[var(--accent)]" strokeWidth={1.5} />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </button>
                ))}
              </div>

              <p className="text-xs text-[var(--text-tertiary)] mb-4">
                {attempts > 0 ? `Attempt ${attempts}${attempts >= 6 ? ' — still trying' : ''}` : 'Checking server status...'}
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
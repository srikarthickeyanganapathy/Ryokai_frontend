import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQueryClient } from '@tanstack/react-query';
import { CloudOff, RefreshCw, Trophy, Volume2, VolumeX } from 'lucide-react';
import api, { SERVER_UNREACHABLE_EVENT } from '@/shared/api/api';
import { Button } from '@/shared/ui/Button';
import { EASING } from '@/shared/lib/uxTokens';

/* ------------------------------------------------------------------ */
/* Server reachability (unchanged)                                     */
/* ------------------------------------------------------------------ */

const PING_INTERVAL_MS = 5000;
const PING_TIMEOUT_MS = 8000;

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

/* ------------------------------------------------------------------ */
/* Shared helpers                                                      */
/* ------------------------------------------------------------------ */

const ESTIMATED_WAKE_S = 150; // timer ring fills over ~2.5 min

const WAKE_STAGES = [
  'Stretching the RAM...',
  'Brewing virtual coffee...',
  'Warming up the JVM...',
  'Reticulating splines...',
  'Negotiating with the router...',
  'Almost there...',
];

const fmtClock = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

const readNumber = (key) => {
  try {
    return Number(localStorage.getItem(key)) || 0;
  } catch {
    return 0;
  }
};

/* ------------------------------------------------------------------ */
/* Game tuning -- every difficulty knob lives here                      */
/* ------------------------------------------------------------------ */

const BEST_KEY = 'ryokai:packet-best';

const GAME = {
  GRAVITY: 1900,     // px/s 
  FLAP_VY: -520,     // px/s boost per tap
  MAX_FALL: 640,     // terminal velocity
  GATE_W: 54,
  POOL: 3,           // recycled gate DOM nodes
  PACKET_X: 0.28,    // horizontal position (fraction of board width)
  PACKET_SIZE: 24,
  HITBOX_PAD: 4,     // forgiveness: hitbox smaller than the sprite
  EDGE: 8,           // ceiling / floor kill zone
  START_SPEED: 150,
  MAX_SPEED: 265,
  START_GAP: 175,
  MIN_GAP: 112,
  START_SPACING: 195,
  MIN_SPACING: 150,
  TRAIL_LIFE: 0.5,   // seconds
};

const ramp = (score) => ({
  speed: Math.min(GAME.MAX_SPEED, GAME.START_SPEED + score * 6),
  gap: Math.max(GAME.MIN_GAP, GAME.START_GAP - score * 2.5),
  spacing: Math.max(GAME.MIN_SPACING, GAME.START_SPACING - score * 2),
});

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

/* ------------------------------------------------------------------ */
/* The game: "Wake-Up Packet"                                          */
/*                                                                     */
/* Architecture: physics lives in refs and is driven by one            */
/* requestAnimationFrame loop that mutates DOM transforms directly --   */
/* zero React re-renders per frame. React state is only used for       */
/* phase changes (ready/playing/dead) and the score (once per gate).   */
/* ------------------------------------------------------------------ */

function WakePacketGame() {
  const boardRef = useRef(null);
  const packetRef = useRef(null);
  const gateRoots = useRef([]);
  const gateTops = useRef([]);
  const gateBots = useRef([]);
  const trailEls = useRef([]);

  const [phase, setPhase] = useState('ready');
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(() => readNumber(BEST_KEY));
  const [newBest, setNewBest] = useState(false);
  const [flashId, setFlashId] = useState(0);
  const [soundOn, setSoundOn] = useState(true);

  const phaseRef = useRef('ready');
  const bestRef = useRef(best);
  const soundRef = useRef(soundOn);
  const audioRef = useRef(null);
  const stateRef = useRef(null);

  useEffect(() => { soundRef.current = soundOn; }, [soundOn]);

  const play = useCallback((kind) => {
    if (!soundRef.current) return;
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      audioRef.current ??= new Ctx();
      const ctx = audioRef.current;
      if (ctx.state === 'suspended') ctx.resume();
      const t = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      if (kind === 'flap') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(340, t);
        osc.frequency.exponentialRampToValueAtTime(520, t + 0.06);
      } else if (kind === 'score') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(660, t);
        osc.frequency.exponentialRampToValueAtTime(990, t + 0.09);
      } else {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(180, t);
        osc.frequency.exponentialRampToValueAtTime(50, t + 0.25);
      }
      gain.gain.setValueAtTime(kind === 'crash' ? 0.06 : 0.04, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + (kind === 'crash' ? 0.28 : 0.12));
      osc.connect(gain).connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.3);
    } catch {
      /* audio is a nice-to-have, never let it break the game */
    }
  }, []);

  useEffect(() => {
    const board = boardRef.current;
    if (!board) return undefined;

    const s = {
      phase: 'ready',
      t: 0,
      last: performance.now(),
      raf: 0,
      w: board.clientWidth,
      h: board.clientHeight,
      y: board.clientHeight / 2,
      vy: 0,
      rot: 0,
      score: 0,
      diedAt: 0,
      lockUntil: 0,
      gates: gateRoots.current.map((root, i) => ({
        root, top: gateTops.current[i], bot: gateBots.current[i],
        active: false, x: 0, gapY: 0, gapH: 0, passed: false,
      })).filter((g) => g.root),
      trail: trailEls.current.map((el) => ({ el, x: 0, y: 0, life: 0 })).filter((d) => d.el),
      trailIdx: 0,
      trailTimer: 0,
    };
    stateRef.current = s;

    const drawPacket = (rot) => {
      const el = packetRef.current;
      if (!el) return;
      el.style.top = `${s.y}px`;
      el.style.transform = `translate(-50%, -50%) rotate(${rot}deg)`;
    };

    const drawGates = () => {
      for (const g of s.gates) {
        g.root.style.display = g.active ? '' : 'none';
        if (g.active) g.root.style.transform = `translateX(${g.x}px)`;
      }
    };

    const spawnGate = (gap) => {
      const g = s.gates.find((x) => !x.active);
      if (!g) return;
      const margin = 46; // keep gaps away from the exact edges
      const min = GAME.EDGE + margin + gap / 2;
      const max = s.h - GAME.EDGE - margin - gap / 2;
      g.gapY = min + Math.random() * Math.max(1, max - min);
      g.gapH = gap;
      g.x = s.w + GAME.GATE_W;
      g.passed = false;
      g.active = true;
      const topH = Math.max(0, g.gapY - g.gapH / 2);
      g.top.style.height = `${topH}px`;
      g.bot.style.top = `${g.gapY + g.gapH / 2}px`;
      g.bot.style.height = `${Math.max(0, s.h - (g.gapY + g.gapH / 2))}px`;
    };

    const die = (now) => {
      s.phase = 'dying';
      phaseRef.current = 'dying';
      s.diedAt = now;
      s.lockUntil = now + 500; // ignore panic-taps right after a crash
      s.rot = clamp(s.vy * 0.16, -30, 85);
      s.trail.forEach((d) => { d.life = 0; d.el.style.opacity = '0'; });
      play('crash');
      setFlashId((n) => n + 1);
    };

    const finalizeDeath = () => {
      s.phase = 'dead';
      phaseRef.current = 'dead';
      setPhase('dead');
      if (s.score > bestRef.current) {
        bestRef.current = s.score;
        setBest(s.score);
        setNewBest(true);
        try { localStorage.setItem(BEST_KEY, String(s.score)); } catch { /* private mode */ }
      } else {
        setNewBest(false);
      }
    };

    const step = (now) => {
      const dt = Math.min(0.033, (now - s.last) / 1000 || 0); // clamp: no teleport after tab-switch
      s.last = now;
      s.t += dt;

      if (s.phase === 'ready') {
        // Idle bobbing behind the "tap to launch" prompt
        s.y = s.h / 2 + Math.sin(s.t * 2.6) * 9;
        drawPacket(Math.sin(s.t * 2.6 + 1) * 7);

      } else if (s.phase === 'playing') {
        const { speed, gap, spacing } = ramp(s.score);

        // Physics
        s.vy = Math.min(GAME.MAX_FALL, s.vy + GAME.GRAVITY * dt);
        s.y += s.vy * dt;

        // Move / despawn gates
        for (const g of s.gates) {
          if (!g.active) continue;
          g.x -= speed * dt;
          if (g.x + GAME.GATE_W < 0) g.active = false;
        }

        // Spawn a new gate once the last one has cleared the right edge
        let rightmost = -Infinity;
        for (const g of s.gates) if (g.active) rightmost = Math.max(rightmost, g.x);
        if (rightmost < s.w - spacing) spawnGate(gap);

        // Scoring + collision
        const px = s.w * GAME.PACKET_X;
        const hw = (GAME.PACKET_SIZE - GAME.HITBOX_PAD) / 2;
        for (const g of s.gates) {
          if (!g.active) continue;
          if (!g.passed && g.x + GAME.GATE_W < px - hw) {
            g.passed = true;
            s.score += 1;
            setScore(s.score);
            play('score');
          }
          if (px + hw > g.x && px - hw < g.x + GAME.GATE_W) {
            const gapTop = g.gapY - g.gapH / 2;
            const gapBot = g.gapY + g.gapH / 2;
            if (s.y - hw < gapTop || s.y + hw > gapBot) {
              die(now);
              break;
            }
          }
        }
        if (s.phase === 'playing' && (s.y < GAME.EDGE || s.y > s.h - GAME.EDGE)) die(now);

        if (s.phase === 'playing') {
          drawPacket(clamp(s.vy * 0.16, -30, 85)); // nose up on boost, dive when falling
          drawGates();

          // Trail particles (pooled DOM, mutated directly)
          s.trailTimer += dt;
          if (s.trailTimer > 0.05) {
            s.trailTimer = 0;
            s.trailIdx = (s.trailIdx + 1) % s.trail.length;
            const d = s.trail[s.trailIdx];
            d.x = px - 8;
            d.y = s.y + (Math.random() * 8 - 4);
            d.life = GAME.TRAIL_LIFE;
          }
          for (const d of s.trail) {
            if (d.life > 0) {
              d.life -= dt;
              d.x -= speed * 0.85 * dt;
              const k = Math.max(0, d.life / GAME.TRAIL_LIFE);
              d.el.style.opacity = String(k * 0.45);
              d.el.style.transform = `translate(${d.x - 3}px, ${d.y - 3}px) scale(${0.5 + 0.5 * k})`;
            }
          }
        }

      } else if (s.phase === 'dying') {
        // Brief death spin, then show the results panel
        s.vy = Math.min(GAME.MAX_FALL, s.vy + GAME.GRAVITY * dt);
        s.y = Math.min(s.y + s.vy * dt, s.h - GAME.PACKET_SIZE / 2 - 2);
        s.rot = Math.min(90, s.rot + 300 * dt);
        drawPacket(s.rot);
        if (s.y >= s.h - GAME.PACKET_SIZE / 2 - 2 || now - s.diedAt > 800) finalizeDeath();
      }

      s.raf = requestAnimationFrame(step);
    };

    const startRun = () => {
      s.phase = 'playing';
      phaseRef.current = 'playing';
      s.y = s.h * 0.45;
      s.vy = GAME.FLAP_VY * 0.75;
      s.rot = 0;
      s.score = 0;
      s.gates.forEach((g) => { g.active = false; });
      drawGates();
      setScore(0);
      setNewBest(false);
      setPhase('playing');
      play('flap');
    };

    const act = () => {
      const now = performance.now();
      if (s.phase === 'ready') startRun();
      else if (s.phase === 'playing') { s.vy = GAME.FLAP_VY; play('flap'); }
      else if (s.phase === 'dead' && now >= s.lockUntil) startRun();
    };

    const onPointer = (e) => {
      if (e.target.closest('[data-ui]')) return; // mute button etc.
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      act();
    };
    const onKey = (e) => {
      if (e.code !== 'Space' && e.code !== 'ArrowUp') return;
      if (e.repeat || e.target.tagName === 'BUTTON') return;
      e.preventDefault();
      act();
    };
    const onResize = () => {
      s.w = board.clientWidth;
      s.h = board.clientHeight;
      s.y = clamp(s.y, GAME.EDGE, s.h - GAME.EDGE);
    };

    board.addEventListener('pointerdown', onPointer);
    window.addEventListener('keydown', onKey);
    window.addEventListener('resize', onResize);
    s.raf = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(s.raf);
      board.removeEventListener('pointerdown', onPointer);
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', onResize);
    };
  }, [play]);

  const gridCss = {
    backgroundImage:
      'linear-gradient(var(--accent-soft) 1px, transparent 1px), linear-gradient(90deg, var(--accent-soft) 1px, transparent 1px)',
    backgroundSize: '36px 36px',
  };

  return (
    <div
      ref={boardRef}
      className="relative w-full h-[380px] rounded-2xl overflow-hidden border border-[var(--accent-border)] bg-[var(--bg-base)] cursor-pointer select-none touch-manipulation"
      role="application"
      aria-label="Wake-up packet game. Tap or press space to boost the packet upward and fly through the gaps. Each gate cleared is one point."
    >
      {/* Parallax background: drifting grid + glow orbs (pure CSS/motion, no JS cost) */}
      <motion.div
        className="absolute inset-0 opacity-40"
        style={gridCss}
        animate={{ x: [0, -36] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
      />
      <motion.div
        className="absolute -top-10 -left-10 w-40 h-40 rounded-full bg-[var(--accent)] opacity-[0.07] blur-2xl"
        animate={{ x: [0, 60, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute -bottom-12 right-0 w-48 h-48 rounded-full bg-[var(--accent)] opacity-[0.05] blur-2xl"
        animate={{ x: [0, -50, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Ceiling & floor -- the kill zones, visually marked */}
      <div className="absolute top-0 inset-x-0 h-2 bg-[var(--accent-soft)] border-b border-[var(--accent-border)]" />
      <div className="absolute bottom-0 inset-x-0 h-2 bg-[var(--accent-soft)] border-t border-[var(--accent-border)]" />

      {/* Gate pool (recycled DOM nodes, positioned by the game loop) */}
      {[...Array(GAME.POOL)].map((_, i) => (
        <div
          key={i}
          ref={(el) => { gateRoots.current[i] = el; }}
          className="absolute left-0 top-0 h-full"
          style={{ width: GAME.GATE_W, display: 'none' }}
        >
          <div
            ref={(el) => { gateTops.current[i] = el; }}
            className="absolute left-0 top-0 w-full bg-[var(--accent-soft)] border-x border-[var(--accent-border)] rounded-b-xl border-b-[3px] border-b-[var(--accent)]"
          />
          <div
            ref={(el) => { gateBots.current[i] = el; }}
            className="absolute left-0 w-full bg-[var(--accent-soft)] border-x border-[var(--accent-border)] rounded-t-xl border-t-[3px] border-t-[var(--accent)]"
          />
        </div>
      ))}

      {/* Trail particles */}
      {[...Array(10)].map((_, i) => (
        <div
          key={i}
          ref={(el) => { trailEls.current[i] = el; }}
          className="absolute top-0 left-0 w-1.5 h-1.5 rounded-full bg-[var(--accent)] pointer-events-none"
          style={{ opacity: 0 }}
        />
      ))}

      {/* The packet */}
      <div ref={packetRef} className="absolute z-[5] w-6 h-6" style={{ top: '50%', left: `${GAME.PACKET_X * 100}%` }}>
        <div className="absolute -inset-1.5 rounded-xl bg-[var(--accent)] opacity-25 blur-[5px]" />
        <div className="relative w-full h-full rounded-[7px] bg-[var(--accent)] border border-white/25 flex items-center justify-center">
          <div className="w-1.5 h-1.5 rounded-[2px] bg-[var(--bg-elevated)]" />
        </div>
      </div>

      {/* Best score chip */}
      <div className="absolute top-3 left-3 z-10 pointer-events-none flex items-center gap-1 text-[10px] font-semibold text-[var(--text-tertiary)] border border-[var(--accent-border)] rounded-full px-2 py-0.5 bg-[var(--bg-base)]/60">
        <Trophy size={10} strokeWidth={1.5} />
        best {best}
      </div>

      {/* Mute toggle */}
      <button
        type="button"
        data-ui
        onClick={(e) => { e.stopPropagation(); setSoundOn((v) => !v); }}
        className="absolute top-2.5 right-2.5 z-10 p-1.5 rounded-lg text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
        aria-label={soundOn ? 'Mute game sounds' : 'Unmute game sounds'}
      >
        {soundOn ? <Volume2 size={14} strokeWidth={1.5} /> : <VolumeX size={14} strokeWidth={1.5} />}
      </button>

      {/* Live score */}
      {phase === 'playing' && (
        <div className="absolute top-3 inset-x-0 z-10 flex justify-center pointer-events-none">
          <motion.span
            key={score}
            initial={{ scale: 1.45 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.2, ease: EASING.out }}
            className="text-3xl font-extrabold text-[var(--text-primary)] tabular-nums"
          >
            {score}
          </motion.span>
        </div>
      )}

      {/* Ready prompt */}
      {phase === 'ready' && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2.5 pointer-events-none">
          <motion.p
            animate={{ y: [0, -6, 0] }}
            transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
            className="text-sm font-semibold text-[var(--text-primary)]"
          >
            Tap or press Space to launch
          </motion.p>
          <p className="text-[11px] text-[var(--text-tertiary)] max-w-[220px]">
            Tap = boost up   thread the gates   every gate cleared is +1
          </p>
        </div>
      )}

      {/* Death panel */}
      {phase === 'dead' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.25, ease: EASING.out }}
          className="absolute inset-0 z-10 flex items-center justify-center bg-[var(--bg-base)]/70 backdrop-blur-[2px] pointer-events-none"
        >
          <div className="text-center">
            <p className="text-[10px] uppercase tracking-widest text-[var(--text-tertiary)] mb-1">
              {newBest ? '  new record  ' : 'signal lost'}
            </p>
            <p className="text-4xl font-extrabold text-[var(--accent)] tabular-nums leading-none mb-1.5">{score}</p>
            <p className="text-[11px] text-[var(--text-tertiary)] mb-4">gates cleared   best {best}</p>
            <p className="text-xs font-semibold text-[var(--text-primary)] animate-pulse">
              Tap to fly again
            </p>
          </div>
        </motion.div>
      )}

      {/* Crash flash */}
      {flashId > 0 && (
        <motion.div
          key={flashId}
          initial={{ opacity: 0.45 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 0.35, ease: EASING.out }}
          className="absolute inset-0 z-20 bg-white pointer-events-none"
        />
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Provider (server logic unchanged from the original)                 */
/* ------------------------------------------------------------------ */

export function ServerStatusProvider({ children }) {
  const queryClient = useQueryClient();
  const [down, setDown] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [elapsed, setElapsed] = useState(0);
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
          await new Promise((r) => setTimeout(r, 500));
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

  // Honest wait timer: elapsed time, ring fills toward a typical wake-up
  useEffect(() => {
    if (!down) {
      setElapsed(0);
      return undefined;
    }
    const id = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [down]);

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
            className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-[var(--bg-base)]/95 backdrop-blur-sm p-4"
            role="alertdialog"
            aria-live="assertive"
            aria-label="Reconnecting to the Ryokai server"
          >
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.05, ease: EASING.out }}
              className="relative flex flex-col items-center text-center w-full max-w-sm my-auto p-6 rounded-3xl border border-[var(--accent-border)] bg-[var(--bg-elevated)] shadow-2xl"
            >
              {/* Header: wait timer */}
              <div className="w-full flex items-center justify-between mb-4">
                <div className="relative w-12 h-12" title="Time waiting">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" stroke="var(--accent-soft)" strokeWidth="10" fill="none" />
                    <motion.circle
                      cx="50" cy="50" r="40"
                      stroke="var(--accent)" strokeWidth="10" fill="none" strokeLinecap="round"
                      strokeDasharray="251.33"
                      initial={false}
                      animate={{ strokeDashoffset: 251.33 * (1 - Math.min(1, elapsed / ESTIMATED_WAKE_S)) }}
                      transition={{ duration: 1, ease: 'linear' }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-[var(--text-primary)]">
                    {fmtClock(elapsed)}
                  </div>
                </div>
                <p className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-wider">
                  typical wake-up 1-3 min
                </p>
              </div>

              <div className="flex items-center gap-2 mb-1">
                <CloudOff className="w-5 h-5 text-[var(--accent)]" strokeWidth={1.5} />
                <h2 className="text-lg font-semibold text-[var(--text-primary)] tracking-tight">
                  Reconnecting to Ryokai
                </h2>
              </div>
              <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed mb-4 max-w-[280px]">
                You're the wake-up packet -- fly through the network to the sleeping server.{' '}
                <span className="text-[var(--text-primary)] font-medium">
                  {WAKE_STAGES[Math.min(WAKE_STAGES.length - 1, Math.floor(elapsed / 7))]}
                </span>
              </p>

              <WakePacketGame />

              <p className="text-xs text-[var(--text-tertiary)] mt-4 mb-4">
                {attempts > 0 ? `Attempt ${attempts}${attempts >= 6 ? ' -- still trying' : ''}   ` : ''}
                your progress is safe and will reload automatically
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

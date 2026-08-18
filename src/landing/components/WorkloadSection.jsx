import { useState, useEffect } from 'react';
import { motion, useAnimation, useInView, AnimatePresence } from 'framer-motion';
import { Search, Activity, Sparkles, Brain } from 'lucide-react';
import { useRef } from 'react';

const AnimatedCounter = ({ value, color, delay = 0 }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  useEffect(() => {
    if (isInView) {
      const duration = 1.5;
      const steps = 30;
      const stepTime = (duration * 1000) / steps;
      const increment = value / steps;
      
      let current = 0;
      setTimeout(() => {
        const timer = setInterval(() => {
          current += increment;
          if (current >= value) {
            setCount(value);
            clearInterval(timer);
          } else {
            setCount(Math.floor(current));
          }
        }, stepTime);
      }, delay * 1000);
    }
  }, [isInView, value, delay]);

  return <div ref={ref} className={`text-3xl font-bold leading-tight ${color}`}>{count}</div>;
};

const HeatmapCell = ({ level, day }) => {
  const [isHovered, setIsHovered] = useState(false);
  const colors = [
    'bg-[var(--bg-subtle)] border border-[var(--border-subtle)]',
    'bg-emerald-500/20 border border-emerald-500/30',
    'bg-emerald-500/40 border border-emerald-500/50',
    'bg-emerald-500/60 border border-emerald-500/70',
    'bg-emerald-500/80 border border-emerald-500/90'
  ];
  const labels = ['Empty', 'Light', 'Normal', 'Heavy', 'Max'];

  return (
    <div 
      className="relative w-full aspect-square rounded-sm transition-transform hover:scale-110 cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`w-full h-full rounded-sm ${colors[level]}`} />
      {isHovered && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-[10px] rounded whitespace-nowrap z-50">
          {day}: {labels[level]} load
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
        </div>
      )}
    </div>
  );
};

export default function WorkloadSection() {
  const [toast, setToast] = useState(null);
  
  const heatmapData = [
    [1, 2, 3, 2, 1, 0, 0],
    [0, 1, 2, 3, 4, 2, 1],
    [1, 2, 1, 0, 1, 2, 1],
    [2, 3, 2, 1, 0, 0, 1],
    [1, 0, 1, 2, 2, 1, 0]
  ];
  
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <section id="workload" className="py-24 relative overflow-hidden">
      <div className="wrap max-w-[1200px] mx-auto px-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          className="sec-label reveal text-[var(--accent)] text-sm font-semibold tracking-wider uppercase mb-4"
        >
          Workload
        </motion.div>
        
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          className="sec-h reveal text-4xl md:text-5xl font-bold text-[var(--text-primary)] tracking-tight leading-tight mb-6"
        >
          See who's overloaded,<br/>before it becomes a bottleneck.
        </motion.h2>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          className="sec-sub reveal text-lg text-[var(--text-secondary)] max-w-2xl mb-16"
        >
          Real capacity per member, a live team-health score, and a heatmap that shows the week at a glance.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="app-stage mt-11 relative"
        >
          <div className="stage-glow absolute inset-0 bg-blue-500/5 blur-[100px] -z-10 rounded-full"></div>
          <div className="appwin max-w-[960px] mx-auto rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-base)] shadow-2xl overflow-hidden relative">
            
            {/* Toast Notification */}
            <AnimatePresence>
              {toast && (
                <motion.div 
                  initial={{ opacity: 0, y: -20, x: '-50%' }}
                  animate={{ opacity: 1, y: 0, x: '-50%' }}
                  exit={{ opacity: 0, y: -20, x: '-50%' }}
                  className="absolute top-16 left-1/2 z-50 px-4 py-2 bg-gray-900 text-white text-sm rounded-lg shadow-xl border border-gray-700 flex items-center gap-2"
                >
                  <Activity size={14} className="text-emerald-400" />
                  {toast}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="topbar h-12 border-b border-[var(--border-subtle)] flex items-center justify-between px-4 bg-[var(--bg-subtle)]">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
                <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50"></div>
              </div>
              <div className="tb-search flex items-center gap-2 px-3 py-1.5 rounded-md bg-[var(--bg-base)] border border-[var(--border-subtle)] text-xs text-[var(--text-secondary)] w-64 justify-center shadow-inner">
                <Search size={14} /> Search or jump to… <span className="kb px-1 py-0.5 rounded bg-[var(--bg-subtle)] border border-[var(--border-subtle)] text-[10px] ml-2">⌘K</span>
              </div>
              <div className="tb-actions flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-[var(--accent)] text-white flex items-center justify-center text-xs font-bold ring-2 ring-[var(--bg-base)]">U</div>
              </div>
            </div>

            <div className="p-8 bg-[var(--bg-base)]">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <div className="text-xs text-[var(--accent)] font-medium uppercase tracking-wider mb-2">Resource Capacity</div>
                  <h2 className="text-2xl font-semibold text-[var(--text-primary)] mb-1">Team Capacity & Utilization</h2>
                  <div className="text-sm text-[var(--text-secondary)]">Monitor team load balance and task allocation bottlenecks across the organization.</div>
                </div>
                <span className="px-3 py-1 bg-[var(--bg-subtle)] border border-[var(--border-subtle)] rounded-full text-xs font-medium text-[var(--text-secondary)]">Threshold 8</span>
              </div>

              {/* KPIs */}
              <div className="grid grid-cols-4 gap-4 mb-8">
                <div className="bg-[var(--bg-subtle)] border border-[var(--border-subtle)] rounded-xl p-5">
                  <div className="text-sm text-[var(--text-secondary)] mb-2 font-medium">Members</div>
                  <AnimatedCounter value={24} color="text-[var(--text-primary)]" delay={0.1} />
                </div>
                <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-5">
                  <div className="text-sm text-red-500/80 mb-2 font-medium">Overloaded</div>
                  <AnimatedCounter value={3} color="text-red-500" delay={0.2} />
                </div>
                <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-xl p-5">
                  <div className="text-sm text-yellow-500/80 mb-2 font-medium">Near limit</div>
                  <AnimatedCounter value={5} color="text-yellow-500" delay={0.3} />
                </div>
                <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-5">
                  <div className="text-sm text-emerald-500/80 mb-2 font-medium">Balanced</div>
                  <AnimatedCounter value={16} color="text-emerald-500" delay={0.4} />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-8">
                {/* Team Health */}
                <div className="bg-[var(--bg-subtle)] border border-[var(--border-subtle)] rounded-xl p-6">
                  <div className="flex justify-between items-center mb-6">
                    <span className="font-semibold text-[var(--text-primary)]">Team Health</span>
                    <span className="text-2xl font-bold text-emerald-500">82</span>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-xs mb-1.5"><span className="text-[var(--text-secondary)]">Balanced</span><span className="font-medium">16</span></div>
                      <div className="h-2 w-full bg-[var(--bg-base)] rounded-full overflow-hidden">
                        <motion.div initial={{ width: 0 }} whileInView={{ width: '67%' }} transition={{ duration: 1, delay: 0.2 }} className="h-full bg-emerald-500 rounded-full" />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1.5"><span className="text-[var(--text-secondary)]">Near limit</span><span className="font-medium">5</span></div>
                      <div className="h-2 w-full bg-[var(--bg-base)] rounded-full overflow-hidden">
                        <motion.div initial={{ width: 0 }} whileInView={{ width: '21%' }} transition={{ duration: 1, delay: 0.3 }} className="h-full bg-yellow-500 rounded-full" />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1.5"><span className="text-[var(--text-secondary)]">Overloaded</span><span className="font-medium">3</span></div>
                      <div className="h-2 w-full bg-[var(--bg-base)] rounded-full overflow-hidden">
                        <motion.div initial={{ width: 0 }} whileInView={{ width: '12%' }} transition={{ duration: 1, delay: 0.4 }} className="h-full bg-red-500 rounded-full" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* AI Insights */}
                <div className="bg-[var(--bg-subtle)] border border-[var(--border-subtle)] rounded-xl p-6">
                  <div className="flex items-center gap-2 font-semibold text-[var(--text-primary)] mb-6">
                    <Brain size={18} className="text-purple-500" /> AI Insights
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded-lg text-sm">
                      <div className="w-2 h-2 rounded-full bg-red-500 flex-none"></div>
                      <span className="flex-1 text-[var(--text-primary)]">Priya, Dev, and Jonas are over 8 tasks.</span>
                      <button onClick={() => showToast("Action initiated: Reassigning tasks...")} className="px-3 py-1 bg-red-500/10 text-red-500 rounded hover:bg-red-500/20 transition-colors font-medium text-xs">Act</button>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded-lg text-sm">
                      <div className="w-2 h-2 rounded-full bg-yellow-500 flex-none"></div>
                      <span className="flex-1 text-[var(--text-primary)]">5 members are within 2 tasks of their limit.</span>
                      <button onClick={() => showToast("Added to watchlist")} className="px-3 py-1 bg-[var(--bg-subtle)] text-[var(--text-secondary)] rounded hover:bg-[var(--bg-base)] border border-[var(--border-subtle)] transition-colors font-medium text-xs">Watch</button>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded-lg text-sm">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 flex-none"></div>
                      <span className="flex-1 text-[var(--text-primary)]">Suggest rebalancing 2 tasks from Priya → Lin.</span>
                      <button onClick={() => showToast("Suggestion applied successfully")} className="px-3 py-1 bg-[var(--accent)] text-white rounded hover:bg-blue-600 transition-colors font-medium text-xs">Suggest</button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Heatmap */}
              <div className="mt-4 p-6 bg-[var(--bg-subtle)] border border-[var(--border-subtle)] rounded-xl">
                <div className="flex justify-between items-end mb-6">
                  <span className="font-semibold text-[var(--text-primary)] text-sm">14-day capacity heatmap</span>
                  <span className="text-xs text-[var(--text-tertiary)]">hover cells for detail</span>
                </div>
                <div className="flex gap-1.5 mb-2">
                  {heatmapData.map((row, i) => (
                    <div key={i} className="flex flex-col gap-1.5 flex-1">
                      {row.map((level, j) => (
                        <HeatmapCell key={j} level={level} day={days[j]} />
                      ))}
                    </div>
                  ))}
                </div>
                <div className="flex justify-between mt-3 px-2 text-[10px] text-[var(--text-tertiary)] uppercase tracking-wider font-medium">
                  {days.map(d => <span key={d} className="flex-1 text-center">{d}</span>)}
                </div>
              </div>
              
              <div className="mt-8 text-center text-xs text-[var(--text-tertiary)] font-mono uppercase tracking-widest">
                V1 · Capacity Command · workload view
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

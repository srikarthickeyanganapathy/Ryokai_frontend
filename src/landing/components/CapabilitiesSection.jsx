import { motion } from 'framer-motion';
import { LayoutList, ShieldCheck, Activity, BarChart2, Focus, LayoutDashboard } from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export default function CapabilitiesSection() {
  const capabilities = [
    {
      num: "01 / PLAN",
      icon: <LayoutList size={24} />,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
      title: "Missions & Projects",
      desc: "Structure goals with the view that fits your workflow -- Kanban boards, lists, tables, or the spatial Nebula graph."
    },
    {
      num: "02 / FOCUS",
      icon: <Focus size={24} />,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
      title: "Focus Mode",
      desc: "Protected deep-work sessions with a dedicated timer and workspace views that minimize context switching."
    },
    {
      num: "03 / COORDINATE",
      icon: <LayoutDashboard size={24} />,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
      title: "Crews & Whiteboards",
      desc: "Dynamic cross-functional squads and shared canvases for synchronous planning and rapid collaboration."
    },
    {
      num: "04 / GOVERN",
      icon: <ShieldCheck size={24} />,
      color: "text-indigo-500",
      bg: "bg-indigo-500/10",
      title: "Roles & Permissions",
      desc: "Scoped role hierarchies and explicit permission grants that keep execution secure and authority clear."
    },
    {
      num: "05 / MEASURE",
      icon: <BarChart2 size={24} />,
      color: "text-sky-400",
      bg: "bg-sky-400/10",
      title: "Analytics & Audit",
      desc: "Cycle time metrics, throughput velocity, and an unalterable audit log of every state transition."
    },
    {
      num: "06 / OPTIMIZE",
      icon: <Activity size={24} />,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
      title: "Workload & Goals",
      desc: "Live capacity heatmaps, workload distribution models, and scenario simulation to prevent team burnout."
    }
  ];

  return (
    <section id="capabilities" className="py-24 relative overflow-hidden bg-[var(--bg-subtle)] border-t border-[var(--border-subtle)]">
      <div className="wrap max-w-[1200px] mx-auto px-6">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={itemVariants}
          className="sec-label reveal text-[var(--accent)] text-sm font-semibold tracking-wider uppercase mb-4"
        >
          Core Capabilities
        </motion.div>
        
        <motion.h2 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={itemVariants}
          className="sec-h reveal text-4xl md:text-5xl font-bold text-[var(--text-primary)] tracking-tight leading-tight mb-6"
        >
          Built for teams that execute<br/>with clarity and control.
        </motion.h2>

        <motion.p 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={itemVariants}
          className="sec-sub reveal text-lg text-[var(--text-secondary)] max-w-2xl mb-16"
        >
          Every capability in Ryokai is engineered to bridge high-level strategy with day-to-day execution across every scope of work.
        </motion.p>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {capabilities.map((cap, idx) => (
            <motion.div 
              key={idx}
              variants={itemVariants}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="p-8 rounded-2xl bg-[var(--bg-base)] border border-[var(--border-subtle)] hover:border-[var(--border-hover)] hover:shadow-lg transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${cap.bg} ${cap.color}`}>
                    {cap.icon}
                  </div>
                  <span className="font-mono text-xs font-semibold text-[var(--text-tertiary)]">{cap.num}</span>
                </div>
                <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-3">{cap.title}</h3>
                <p className="text-[var(--text-secondary)] text-sm leading-relaxed">{cap.desc}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

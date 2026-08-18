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
      icon: <LayoutList size={24} />,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
      title: "Missions & projects",
      desc: "Plan and ship with the view that fits — Kanban, list, table, or the spatial Nebula graph."
    },
    {
      icon: <ShieldCheck size={24} />,
      color: "text-indigo-500",
      bg: "bg-indigo-500/10",
      title: "Roles & permissions",
      desc: "The four-stage authorization engine resolves every grant to an explicit, scoped level."
    },
    {
      icon: <Activity size={24} />,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
      title: "Workload & goals",
      desc: "See who's overloaded and who has room. Track goals against real capacity."
    },
    {
      icon: <BarChart2 size={24} />,
      color: "text-blue-400",
      bg: "bg-blue-400/10",
      title: "Analytics & audit",
      desc: "Insights you can act on, and an audit trail that shows exactly what happened."
    },
    {
      icon: <Focus size={24} />,
      color: "text-yellow-500",
      bg: "bg-yellow-500/10",
      title: "Focus",
      desc: "Protected deep-work sessions with a timer that keeps the noise out."
    },
    {
      icon: <LayoutDashboard size={24} />,
      color: "text-emerald-400",
      bg: "bg-emerald-400/10",
      title: "Whiteboards",
      desc: "Real-time shared canvases for crews to think and plan together."
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
          Capabilities
        </motion.div>
        
        <motion.h2 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={itemVariants}
          className="sec-h reveal text-4xl md:text-5xl font-bold text-[var(--text-primary)] tracking-tight leading-tight mb-16"
        >
          Built for teams that need<br/>to know who can do what.
        </motion.h2>

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
              className="p-8 rounded-2xl bg-[var(--bg-base)] border border-[var(--border-subtle)] hover:border-[var(--border-hover)] hover:shadow-lg transition-all"
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 ${cap.bg} ${cap.color}`}>
                {cap.icon}
              </div>
              <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-3">{cap.title}</h3>
              <p className="text-[var(--text-secondary)] text-sm leading-relaxed">{cap.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

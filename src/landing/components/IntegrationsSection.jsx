import { motion } from 'framer-motion';
import { Github, Key } from 'lucide-react';

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

export default function IntegrationsSection() {
  return (
    <section className="py-24 relative overflow-hidden bg-[var(--bg-base)]">
      <div className="wrap max-w-[1200px] mx-auto px-6 text-center flex flex-col items-center">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={itemVariants}
          className="sec-label reveal text-[var(--accent)] text-sm font-semibold tracking-wider uppercase mb-4"
        >
          Integrations
        </motion.div>
        
        <motion.h2 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={itemVariants}
          className="sec-h reveal text-4xl md:text-5xl font-bold text-[var(--text-primary)] tracking-tight leading-tight mb-6"
        >
          Plays with the tools you already use.
        </motion.h2>
        
        <motion.p 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={itemVariants}
          className="sec-sub reveal text-lg text-[var(--text-secondary)] max-w-2xl mb-16 mx-auto"
        >
          Starting with the developer workflow.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex items-center justify-center gap-6"
        >
          <div className="flex items-center gap-3 px-6 py-4 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] font-medium text-[var(--text-primary)] shadow-sm hover:border-[var(--border-hover)] transition-colors cursor-pointer">
            <Github size={24} /> GitHub
          </div>
          <span className="text-2xl text-[var(--text-tertiary)] font-light">+</span>
          <div className="flex items-center gap-3 px-6 py-4 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] font-medium text-[var(--text-primary)] shadow-sm hover:border-[var(--border-hover)] transition-colors cursor-pointer">
            <Key size={24} /> OAuth / SSO
          </div>
        </motion.div>
      </div>
    </section>
  );
}

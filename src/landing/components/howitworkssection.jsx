import { motion } from 'framer-motion';
import {
  Plus,
  Zap,
  Upload,
  CheckCircle2,
  RotateCcw,
  ImageIcon,
  CheckCheck,
} from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
};

const STEPS = [
  {
    icon: Plus,
    title: 'Create',
    desc: 'Capture a task, set priority and due date, and assign an owner — creator, assignee and reviewer are separate roles.',
    state: 'Created → assigned',
    tone: 'info',
    iconCls: 'bg-blue-500/10 text-blue-500',
    stateCls: 'bg-blue-500/10 text-blue-500',
  },
  {
    icon: Zap,
    title: 'Work',
    desc: 'The assignee owns the task, tracks progress, and attaches typed evidence — links, GitHub, screenshots, recordings, notes.',
    state: 'In progress · assignee owns',
    tone: 'warning',
    iconCls: 'bg-yellow-500/10 text-yellow-500',
    stateCls: 'bg-yellow-500/10 text-yellow-500',
  },
  {
    icon: Upload,
    title: 'Submit',
    desc: 'Submission is denied without evidence. The task enters review as a first-class state, not a comment thread.',
    state: 'Submitted · evidence gate',
    tone: 'violet',
    iconCls: 'bg-purple-500/10 text-purple-500',
    stateCls: 'bg-purple-500/10 text-purple-500',
  },
  {
    icon: CheckCircle2,
    title: 'Approve',
    desc: 'A reviewer who outranks the assignee decides. No self-review — approval is a recorded transition, and it is terminal.',
    state: 'Approved · terminal',
    tone: 'success',
    iconCls: 'bg-emerald-500/10 text-emerald-500',
    stateCls: 'bg-emerald-500/10 text-emerald-500',
  },
  {
    icon: RotateCcw,
    title: 'Reject',
    desc: 'Rejections require a reason and route work back for rework. Rework is part of the design — control stays with the worker.',
    state: 'Rejected → rework',
    tone: 'danger',
    iconCls: 'bg-red-500/10 text-red-500',
    stateCls: 'bg-red-500/10 text-red-500',
  },
];

export default function HowItWorksSection() {
  return (
    <section id="how" className="py-24 relative overflow-hidden">
      <div className="wrap max-w-[1200px] mx-auto px-6">
        <motion.div variants={itemVariants} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-100px' }} className="sec-label reveal text-[var(--accent)] text-sm font-semibold tracking-wider uppercase mb-4">
          How it works
        </motion.div>
        <motion.h2 variants={itemVariants} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-100px' }} className="sec-h reveal text-4xl md:text-5xl font-bold text-[var(--text-primary)] tracking-tight leading-tight mb-6">
          One governed path for every task,<br />from idea to approved.
        </motion.h2>
        <motion.p variants={itemVariants} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-100px' }} className="sec-sub reveal text-lg text-[var(--text-secondary)] max-w-2xl mb-16">
          Every piece of work follows the same explicit lifecycle. Nothing skips a step, nothing marks itself done, and every transition is a recorded decision by someone with the right to make it.
        </motion.p>

        <motion.div variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-100px' }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {STEPS.map((s) => (
            <motion.div key={s.title} variants={itemVariants} className="relative text-center lg:text-left">
              <div className={`w-12 h-12 rounded-xl mx-auto lg:mx-0 flex items-center justify-center mb-4 ${s.iconCls}`}>
                <s.icon size={22} strokeWidth={1.7} />
              </div>
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">{s.title}</h3>
              <p className="text-[13px] text-[var(--text-tertiary)] leading-relaxed mb-3">{s.desc}</p>
              <span className={`inline-block text-[10px] font-mono font-medium tracking-wide uppercase px-2 py-1 rounded-md ${s.stateCls}`}>{s.state}</span>
            </motion.div>
          ))}
        </motion.div>

        <motion.div variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-100px' }} className="grid md:grid-cols-2 gap-4 mt-12">
          <motion.div variants={itemVariants} className="flex gap-4 p-6 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-subtle)]/50">
            <span className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0"><ImageIcon size={18} strokeWidth={1.7} /></span>
            <div>
              <h4 className="text-[15px] font-semibold mb-1">Evidence before approval</h4>
              <p className="text-[13px] text-[var(--text-tertiary)] leading-relaxed">Six typed evidence kinds — LINK, GITHUB, SCREENSHOT, RECORDING, SNIPPET, NOTE — make the record machine-readable, not a wall of text.</p>
            </div>
          </motion.div>
          <motion.div variants={itemVariants} className="flex gap-4 p-6 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-subtle)]/50">
            <span className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0"><CheckCheck size={18} strokeWidth={1.7} /></span>
            <div>
              <h4 className="text-[15px] font-semibold mb-1">Approvals with rules</h4>
              <p className="text-[13px] text-[var(--text-tertiary)] leading-relaxed">Reviewer must outrank the assignee, rejections need a reason, and policy predicates run on every decision. "Looks good" is not a review.</p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

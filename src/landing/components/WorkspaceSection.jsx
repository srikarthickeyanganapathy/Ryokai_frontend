import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Info, Layers, Users, Check, Play, Square, UserPlus, UserMinus, Monitor, FileText, Calendar } from 'lucide-react';

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

const PersonalDemo = () => {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(time => time - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const toggleTimer = (e) => {
    e.stopPropagation();
    setIsActive(!isActive);
  };

  const resetTimer = (e) => {
    e.stopPropagation();
    setIsActive(false);
    setTimeLeft(25 * 60);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <motion.div 
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="mt-4 p-4 rounded-lg bg-[var(--bg-subtle)] border border-[var(--border-subtle)]"
    >
      <div className="text-sm text-[var(--text-secondary)] mb-2 font-medium">Focus Session</div>
      <div className="flex items-center justify-between">
        <div className="text-3xl font-mono tracking-wider font-bold text-[var(--text-primary)]">
          {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </div>
        <div className="flex gap-2">
          <button onClick={toggleTimer} className="p-2 rounded bg-[var(--bg-base)] border border-[var(--border-subtle)] hover:border-[var(--accent)] text-[var(--text-primary)] transition-colors">
            {isActive ? <Square size={16} /> : <Play size={16} />}
          </button>
          <button onClick={resetTimer} className="p-2 rounded bg-[var(--bg-base)] border border-[var(--border-subtle)] hover:border-[var(--text-secondary)] text-[var(--text-secondary)] transition-colors">
            Reset
          </button>
        </div>
      </div>
    </motion.div>
  );
};

const OrgDemo = () => {
  return (
    <motion.div 
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="mt-4 p-4 rounded-lg bg-[var(--bg-subtle)] border border-[var(--border-subtle)] flex flex-col items-center gap-3"
    >
      <div className="text-sm text-[var(--text-secondary)] w-full font-medium mb-1">Org Chart (Engineering)</div>
      <div className="px-3 py-1.5 rounded bg-[var(--bg-base)] border border-[var(--border-subtle)] text-sm text-[var(--text-primary)] font-medium z-10 relative">
        Sarah (VP Eng)
      </div>
      <div className="w-px h-4 bg-[var(--border-subtle)] -my-3 z-0"></div>
      <div className="w-48 h-px bg-[var(--border-subtle)] z-0"></div>
      <div className="flex gap-4 w-full justify-center relative z-10 pt-2">
        <div className="relative flex flex-col items-center">
          <div className="absolute -top-3 w-px h-3 bg-[var(--border-subtle)]"></div>
          <div className="px-3 py-1.5 rounded bg-[var(--bg-base)] border border-[var(--border-subtle)] text-sm text-[var(--text-primary)]">Alex (Lead)</div>
        </div>
        <div className="relative flex flex-col items-center">
          <div className="absolute -top-3 w-px h-3 bg-[var(--border-subtle)]"></div>
          <div className="px-3 py-1.5 rounded bg-[var(--bg-base)] border border-[var(--border-subtle)] text-sm text-[var(--text-primary)]">Sam (Dev)</div>
        </div>
        <div className="relative flex flex-col items-center">
          <div className="absolute -top-3 w-px h-3 bg-[var(--border-subtle)]"></div>
          <div className="px-3 py-1.5 rounded bg-[var(--bg-base)] border border-[var(--border-subtle)] text-sm text-[var(--text-primary)]">Jordan (Dev)</div>
        </div>
      </div>
    </motion.div>
  );
};

const CrewsDemo = () => {
  const [members, setMembers] = useState([
    { id: 1, name: 'Taylor', role: 'Frontend', joined: true },
    { id: 2, name: 'Casey', role: 'Design', joined: true },
    { id: 3, name: 'You', role: 'Developer', joined: false },
  ]);

  const toggleJoin = (e, id) => {
    e.stopPropagation();
    setMembers(members.map(m => m.id === id ? { ...m, joined: !m.joined } : m));
  };

  return (
    <motion.div 
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="mt-4 p-4 rounded-lg bg-[var(--bg-subtle)] border border-[var(--border-subtle)] flex flex-col gap-2"
    >
      <div className="text-sm text-[var(--text-secondary)] font-medium mb-1">Crew: Apollo Launch</div>
      {members.map(member => (
        <div key={member.id} className="flex items-center justify-between p-2 rounded bg-[var(--bg-base)] border border-[var(--border-subtle)]">
          <div>
            <div className="text-sm font-medium text-[var(--text-primary)]">{member.name}</div>
            <div className="text-xs text-[var(--text-secondary)]">{member.role}</div>
          </div>
          <button 
            onClick={(e) => toggleJoin(e, member.id)}
            disabled={member.name !== 'You'}
            className={`p-1.5 rounded flex items-center gap-1 text-xs font-medium transition-colors ${
              member.joined 
                ? 'bg-[var(--bg-subtle)] text-[var(--text-secondary)] border border-[var(--border-subtle)]' 
                : 'bg-[var(--accent)] text-white border border-[var(--accent)]'
            } ${member.name !== 'You' ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            {member.joined ? <UserMinus size={14} /> : <UserPlus size={14} />}
            {member.joined ? 'Leave' : 'Join'}
          </button>
        </div>
      ))}
    </motion.div>
  );
};

export default function WorkspaceSection() {
  const [expandedCard, setExpandedCard] = useState(null);

  return (
    <section id="workspace" className="py-24 relative overflow-hidden">
      <div className="wrap max-w-[1200px] mx-auto px-6">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={itemVariants}
          className="sec-label reveal text-[var(--accent)] text-sm font-semibold tracking-wider uppercase mb-4"
        >
          One workspace · three scopes
        </motion.div>
        
        <motion.h2 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={itemVariants}
          className="sec-h reveal text-4xl md:text-5xl font-bold text-[var(--text-primary)] tracking-tight leading-tight mb-6"
        >
          Personal, Org, and Crews.<br/>One place, three boundaries.
        </motion.h2>
        
        <motion.p 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={itemVariants}
          className="sec-sub reveal text-lg text-[var(--text-secondary)] max-w-2xl mb-16"
        >
          Deep individual focus, cross-team alignment, and open collaboration — each with its own explicit access boundary.
        </motion.p>
        
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="tri-grid grid grid-cols-1 md:grid-cols-3 gap-6 stagger"
        >
          {/* Personal Card */}
          <motion.div 
            layout
            variants={itemVariants}
            onClick={() => setExpandedCard(expandedCard === 'personal' ? null : 'personal')}
            className={`tri-card p-6 rounded-2xl bg-[var(--bg-base)] border transition-all cursor-pointer overflow-hidden ${
              expandedCard === 'personal' 
                ? 'border-[var(--accent)] shadow-[0_8px_30px_rgba(0,112,243,0.12)] -translate-y-1' 
                : 'border-[var(--border-subtle)] hover:border-[var(--border-hover)] hover:shadow-lg hover:-translate-y-1'
            }`}
          >
            <div className="ic ic-info w-12 h-12 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center mb-6">
              <Info size={24} />
            </div>
            <motion.h3 layout className="text-xl font-semibold text-[var(--text-primary)] mb-3">Personal</motion.h3>
            <motion.p layout className="text-[var(--text-secondary)] mb-6 text-sm leading-relaxed">
              Your private command deck — tasks, focus sessions, notes, and saved items. No team noise.
            </motion.p>
            <motion.ul layout className="space-y-3 mb-2">
              <li className="flex items-center text-sm text-[var(--text-secondary)]">
                <Check size={16} className="mr-3 text-[var(--accent)]" /> Personal tasks & priorities
              </li>
              <li className="flex items-center text-sm text-[var(--text-secondary)]">
                <Check size={16} className="mr-3 text-[var(--accent)]" /> Focus timer for deep work
              </li>
              <li className="flex items-center text-sm text-[var(--text-secondary)]">
                <Check size={16} className="mr-3 text-[var(--accent)]" /> Notes, calendar & saved
              </li>
            </motion.ul>
            <AnimatePresence>
              {expandedCard === 'personal' && <PersonalDemo />}
            </AnimatePresence>
          </motion.div>

          {/* Org Card */}
          <motion.div 
            layout
            variants={itemVariants}
            onClick={() => setExpandedCard(expandedCard === 'org' ? null : 'org')}
            className={`tri-card p-6 rounded-2xl bg-[var(--bg-base)] border transition-all cursor-pointer overflow-hidden ${
              expandedCard === 'org' 
                ? 'border-[var(--accent)] shadow-[0_8px_30px_rgba(0,112,243,0.12)] -translate-y-1' 
                : 'border-[var(--border-subtle)] hover:border-[var(--border-hover)] hover:shadow-lg hover:-translate-y-1'
            }`}
          >
            <div className="ic ic-secondary w-12 h-12 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center mb-6">
              <Layers size={24} />
            </div>
            <motion.h3 layout className="text-xl font-semibold text-[var(--text-primary)] mb-3">Org</motion.h3>
            <motion.p layout className="text-[var(--text-secondary)] mb-6 text-sm leading-relaxed">
              Alignment at scale — projects, teams, directory, goals, roles, workload, and analytics, resolved per role.
            </motion.p>
            <motion.ul layout className="space-y-3 mb-2">
              <li className="flex items-center text-sm text-[var(--text-secondary)]">
                <Check size={16} className="mr-3 text-purple-500" /> Projects, teams & directory
              </li>
              <li className="flex items-center text-sm text-[var(--text-secondary)]">
                <Check size={16} className="mr-3 text-purple-500" /> Goals, workload & analytics
              </li>
              <li className="flex items-center text-sm text-[var(--text-secondary)]">
                <Check size={16} className="mr-3 text-purple-500" /> Roles, leave & announcements
              </li>
            </motion.ul>
            <AnimatePresence>
              {expandedCard === 'org' && <OrgDemo />}
            </AnimatePresence>
          </motion.div>

          {/* Crews Card */}
          <motion.div 
            layout
            variants={itemVariants}
            onClick={() => setExpandedCard(expandedCard === 'crews' ? null : 'crews')}
            className={`tri-card p-6 rounded-2xl bg-[var(--bg-base)] border transition-all cursor-pointer overflow-hidden ${
              expandedCard === 'crews' 
                ? 'border-[var(--accent)] shadow-[0_8px_30px_rgba(0,112,243,0.12)] -translate-y-1' 
                : 'border-[var(--border-subtle)] hover:border-[var(--border-hover)] hover:shadow-lg hover:-translate-y-1'
            }`}
          >
            <div className="ic ic-success w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-6">
              <Users size={24} />
            </div>
            <motion.h3 layout className="text-xl font-semibold text-[var(--text-primary)] mb-3">Crews</motion.h3>
            <motion.p layout className="text-[var(--text-secondary)] mb-6 text-sm leading-relaxed">
              Self-organizing crews with shared tasks and whiteboards — membership is the permission, leaving is always yours.
            </motion.p>
            <motion.ul layout className="space-y-3 mb-2">
              <li className="flex items-center text-sm text-[var(--text-secondary)]">
                <Check size={16} className="mr-3 text-emerald-500" /> Crews & crew-scoped tasks
              </li>
              <li className="flex items-center text-sm text-[var(--text-secondary)]">
                <Check size={16} className="mr-3 text-emerald-500" /> Shared whiteboards
              </li>
              <li className="flex items-center text-sm text-[var(--text-secondary)]">
                <Check size={16} className="mr-3 text-emerald-500" /> Discover crews to join
              </li>
            </motion.ul>
            <AnimatePresence>
              {expandedCard === 'crews' && <CrewsDemo />}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

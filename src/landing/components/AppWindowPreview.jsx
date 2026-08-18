import { motion } from 'framer-motion';
import {
  Search,
  Box,
  LayoutDashboard,
  Inbox,
  CheckCircle2,
  Folder,
  Github,
  Zap,
  Calendar,
  FileText,
  BarChart3,
  Bookmark,
  Sun,
  Bell,
  Plus,
  Layout,
  Lightbulb,
  TrendingUp,
  Circle,
  ListTodo
} from 'lucide-react';

export default function AppWindowPreview() {
  return (
    <div className="app-stage">
      <div className="stage-glow"></div>
      <motion.div
        className="appwin reveal"
        initial={{ y: 60, opacity: 0, rotateX: 10, scale: 0.95 }}
        whileInView={{ y: 0, opacity: 1, rotateX: 0, scale: 1 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        style={{ transformOrigin: 'top center', perspective: 1000 }}
      >
        <div className="app-shell">
          {/* Sidebar */}
          <div className="sidebar">
            <div className="sb-user">
              <span className="av">AM</span>
              <div>
                <div className="nm">Alex Morgan</div>
                <div className="em">alex@ryokai.dev</div>
              </div>
            </div>
            
            <motion.div className="sb-ws" whileHover={{ backgroundColor: 'var(--bg-hover)' }}>
              <span className="ic"><Box size={16} /></span>
              <div>
                <div className="t">Personal</div>
                <div className="s">Switch workspace</div>
              </div>
            </motion.div>
            
            <motion.div className="sb-search" whileHover={{ backgroundColor: 'var(--bg-hover)' }}>
              <Search size={16} />
              <span>
                Search...
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ repeat: Infinity, duration: 0.8, repeatType: 'reverse' }}
                  className="inline-block w-[2px] h-[14px] bg-current align-middle ml-1"
                />
              </span>
              <span className="kb">⌘K</span>
            </motion.div>
            
            <div className="sb-sec">Workspace</div>
            
            <motion.div className="sb-item active" whileHover={{ x: 2 }}>
              <LayoutDashboard size={16} /> Home
            </motion.div>
            <motion.div className="sb-item" whileHover={{ x: 2, backgroundColor: 'var(--bg-hover)' }}>
              <Inbox size={16} /> Inbox
            </motion.div>
            <motion.div className="sb-item" whileHover={{ x: 2, backgroundColor: 'var(--bg-hover)' }}>
              <CheckCircle2 size={16} /> My Tasks
            </motion.div>
            <motion.div className="sb-item" whileHover={{ x: 2, backgroundColor: 'var(--bg-hover)' }}>
              <Folder size={16} /> Projects
            </motion.div>
            
            <div className="sb-sec">Code</div>
            <motion.div className="sb-item" whileHover={{ x: 2, backgroundColor: 'var(--bg-hover)' }}>
              <Github size={16} /> GitHub
            </motion.div>
            <motion.div className="sb-item" whileHover={{ x: 2, backgroundColor: 'var(--bg-hover)' }}>
              <Zap size={16} /> Focus
            </motion.div>
            
            <div className="sb-sec">Tools</div>
            <motion.div className="sb-item" whileHover={{ x: 2, backgroundColor: 'var(--bg-hover)' }}>
              <Calendar size={16} /> Calendar
            </motion.div>
            <motion.div className="sb-item" whileHover={{ x: 2, backgroundColor: 'var(--bg-hover)' }}>
              <FileText size={16} /> Notes
            </motion.div>
            <motion.div className="sb-item" whileHover={{ x: 2, backgroundColor: 'var(--bg-hover)' }}>
              <BarChart3 size={16} /> Analytics
            </motion.div>
            <motion.div className="sb-item" whileHover={{ x: 2, backgroundColor: 'var(--bg-hover)' }}>
              <Bookmark size={16} /> Saved
            </motion.div>
            
            <div className="sb-spacer"></div>
            <div className="sb-collapse">◂</div>
          </div>

          {/* Main Card */}
          <div className="maincard">
            <div className="topbar">
              <div className="tb-actions"></div>
              <div className="tb-search">
                <Search size={16} /> Search or jump to… <span className="kb">⌘K</span>
              </div>
              <div className="tb-actions">
                <motion.span className="tb-ic" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                  <Sun size={18} />
                </motion.span>
                <motion.span className="tb-ic" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                  <Bell size={18} />
                  <span className="bdot">2</span>
                </motion.span>
                <span className="mark" style={{ width: 22, height: 22 }}>
                  <svg viewBox="0 0 100 100" fill="none" style={{ width: 14, height: 14 }}>
                    <ellipse cx="50" cy="50" rx="44" ry="24" stroke="url(#pgRing)" strokeWidth="8" transform="rotate(-22 50 50)" opacity="0.9" />
                    <circle cx="50" cy="50" r="20" fill="url(#pgCore)" />
                    <circle cx="50" cy="50" r="9" fill="#E0F2FE" />
                  </svg>
                </span>
              </div>
            </div>
            
            <div className="pagebody">
              <div className="ph">
                <div>
                  <div className="ph-eyebrow">Personal Space</div>
                  <h2>Good morning, Alex</h2>
                  <div className="sub">Your private execution space. Focus on what matters.</div>
                </div>
                <span className="pill">Personal</span>
              </div>
              
              <div className="quickbar">
                <motion.span className="qbtn" whileHover={{ scale: 1.02, backgroundColor: 'var(--bg-elevated)' }} whileTap={{ scale: 0.98 }}>
                  <Plus size={16} /> Create Task <span className="kb">T</span>
                </motion.span>
                <motion.span className="qbtn" whileHover={{ scale: 1.02, backgroundColor: 'var(--bg-elevated)' }} whileTap={{ scale: 0.98 }}>
                  <Layout size={16} /> New Project <span className="kb">P</span>
                </motion.span>
                <motion.span className="qbtn" whileHover={{ scale: 1.02, backgroundColor: 'var(--bg-elevated)' }} whileTap={{ scale: 0.98 }}>
                  <Zap size={16} /> Focus Mode <span className="kb">F</span>
                </motion.span>
              </div>
              
              <div className="dashgrid">
                <div className="dashleft">
                  <div className="focuscard">
                    <div className="fg"></div>
                    <div className="fc-tags">
                      <span className="b-primary">Primary Focus</span>
                      <span className="b-warn">in progress</span>
                    </div>
                    <div className="fc-title">Ship the new landing page</div>
                    <div className="fc-meta">
                      <span>Project: Q3 Landing</span>
                      <span>· Priority: High</span>
                      <span>· Due Aug 21</span>
                    </div>
                    <motion.span className="fc-btn" whileHover={{ x: 5 }}>
                      Resume Work <span>→</span>
                    </motion.span>
                  </div>
                  
                  <div className="queue">
                    <div className="q-head">
                      <ListTodo size={18} />
                      <span className="t">Execution Queue</span>
                      <span className="cnt">4 active</span>
                    </div>
                    <motion.div className="qrow" whileHover={{ backgroundColor: 'var(--bg-hover)' }}>
                      <span className="sd sd-doing"></span>
                      <span className="tt">Ship the new landing page</span>
                      <span className="tg tg-pers">Personal</span>
                      <span className="du">Aug 21</span>
                      <span className="st">in progress</span>
                    </motion.div>
                    <motion.div className="qrow" whileHover={{ backgroundColor: 'var(--bg-hover)' }}>
                      <span className="sd sd-open"></span>
                      <span className="tt">Review Q3 permissions audit</span>
                      <span className="tg tg-pers">Personal</span>
                      <span className="du">Aug 24</span>
                      <span className="st">open</span>
                    </motion.div>
                    <motion.div className="qrow" whileHover={{ backgroundColor: 'var(--bg-hover)' }}>
                      <span className="sd sd-open"></span>
                      <span className="tt">Draft crew onboarding flow</span>
                      <span className="tg tg-pers">Personal</span>
                      <span className="du">Aug 28</span>
                      <span className="st">open</span>
                    </motion.div>
                    <motion.div className="qrow done" whileHover={{ backgroundColor: 'var(--bg-hover)' }}>
                      <span className="sd sd-done"></span>
                      <span className="tt">Update analytics dashboard</span>
                      <span className="tg tg-pers">Personal</span>
                      <span className="du">Aug 18</span>
                      <span className="st">done</span>
                    </motion.div>
                  </div>
                </div>
                
                <div className="dashright">
                  <div className="aicard">
                    <div className="h"><Lightbulb size={16} /> AI Insights</div>
                    <div className="ai-row">
                      <Lightbulb size={18} className="text-amber-400 shrink-0" />
                      <div>
                        <div className="t">Suggested focus</div>
                        <div className="d">Focus on tasks currently in progress to maintain momentum.</div>
                      </div>
                    </div>
                    <div className="ai-row">
                      <TrendingUp size={18} className="text-emerald-400 shrink-0" />
                      <div>
                        <div className="t">Productivity trend</div>
                        <div className="d">Your workspace tasks are synced and updated in real-time.</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="aicard">
                    <div className="h"><Calendar size={16} /> Upcoming</div>
                    <div className="ai-row !mb-0">
                      <Circle size={14} className="text-slate-500 shrink-0" />
                      <div>
                        <div className="t">Landing page</div>
                        <div className="d">Aug 21</div>
                      </div>
                    </div>
                    <div className="ai-row !mb-0">
                      <Circle size={14} className="text-slate-500 shrink-0" />
                      <div>
                        <div className="t">Q3 permissions audit</div>
                        <div className="d">Aug 24</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

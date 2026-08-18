import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import AppWindowPreview from './AppWindowPreview';

const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    }
  }
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] }
  }
};

export default function HeroSection() {
  return (
    <header className="hero">
      <div className="glow glow-1"></div>
      <div className="glow glow-2"></div>
      <div className="glow glow-3"></div>
      
      <div className="wrap hero-in">
        <motion.div 
          className="stagger"
          variants={staggerContainer}
          initial="hidden"
          animate="show"
        >
          <motion.div variants={fadeUp} className="hero-badge">
            <motion.span 
              className="dot"
              animate={{ opacity: [1, 0.4, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', backgroundColor: 'var(--success, #10B981)', marginRight: 8 }}
            /> 
            Multi-tenant work governance
          </motion.div>
          
          <motion.h1 variants={fadeUp}>
            Clarity at <span className="grad">every scope</span>
            <motion.span 
              animate={{ opacity: [1, 0] }} 
              transition={{ duration: 0.8, repeat: Infinity, ease: "steps(2)" }}
              style={{ display: 'inline-block', width: '0.1em', backgroundColor: 'currentColor', marginLeft: 4, transform: 'translateY(2px)' }}
            />
            <br />
            of work.
          </motion.h1>
          
          <motion.p variants={fadeUp} className="hero-sub">
            Ryokai is the workspace where <b>personal focus</b>, <b>org alignment</b>, and <b>crew collaboration</b> live under one explicit permission model — so every person knows exactly what they can see and do.
          </motion.p>
          
          <motion.div variants={fadeUp} className="hero-cta">
            <Link className="btn btn-primary" to="/register">
              Start free <span className="arr">→</span>
            </Link>
            <a className="btn btn-ghost" href="mailto:sales@ryokai.dev">
              Request a demo
            </a>
          </motion.div>
          
          <motion.div variants={fadeUp} className="hero-note">
            Free personal & crew workspaces · No credit card required
          </motion.div>
        </motion.div>

        <AppWindowPreview />
      </div>
    </header>
  );
}

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sun, Moon } from 'lucide-react';
import { RyokaiMark } from './RyokaiMark';

export function LandingNav() {
  const [scrolled, setScrolled] = useState(false);
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('ryokai-theme') || 'dark') !== 'light';
    }
    return true;
  });

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    // Initial check
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('ryokai-theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  return (
    <nav className={scrolled ? 'scrolled' : ''}>
      <div className="wrap nav-in">
        <div className="brand">
          <RyokaiMark size={24} />
          <span className="brand-word">Ryokai</span>
        </div>
        
        <div className="nav-links">
          <a href="#workspace">Workspace</a>
          <a href="#governance">Governance</a>
          <a href="#workload">Workload</a>
          <a href="#capabilities">Capabilities</a>
        </div>
        
        <div className="nav-right">
          <button 
            className="theme-toggle" 
            onClick={() => setIsDark(!isDark)}
            aria-label="Toggle theme"
          >
            <Sun className="ic-sun" size={16} strokeWidth={2} />
            <Moon className="ic-moon" size={16} strokeWidth={2} />
          </button>
          
          <Link to="/login" className="nav-signin">
            Sign in
          </Link>
          
          <Link to="/register" className="btn btn-primary" style={{ padding: '9px 17px' }}>
            Start free
          </Link>
        </div>
      </div>
    </nav>
  );
}

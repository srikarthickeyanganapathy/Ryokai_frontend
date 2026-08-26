import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/app/providers/ThemeProvider';
import { RyokaiMark } from './RyokaiMark';

export function LandingNav() {
  const [scrolled, setScrolled] = useState(false);
  const { theme, setTheme } = useTheme();
  const isDark =
    theme === 'dark' ||
    (theme === 'system' &&
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    // Initial check
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={scrolled ? 'scrolled' : ''}>
      <div className="wrap nav-in">
        <div className="brand">
          <RyokaiMark size={28} />
          <span className="brand-word">Ryokai</span>
        </div>
        
        <div className="nav-links">
          <a href="#how-it-works">How it works</a>
          <a href="#workspace">Workspace</a>
          <a href="#capabilities">Capabilities</a>
          <a href="#governance">Governance</a>
          <a href="#workload">Workload</a>
        </div>
        
        <div className="nav-right">
          <button 
            className="theme-toggle" 
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
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


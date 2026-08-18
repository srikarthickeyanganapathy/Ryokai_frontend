import React from 'react';

export function Footer() {
  return (
    <footer>
      <div className="wrap">
        <div className="foot-grid">
          <div className="foot-brand">
            <div className="brand">
              <span className="mark" style={{ width: 22, height: 22 }}>
                <svg viewBox="0 0 100 100" fill="none" style={{ width: 15, height: 15 }}>
                  <ellipse cx="50" cy="50" rx="44" ry="24" stroke="url(#pgRing)" strokeWidth="8" transform="rotate(-22 50 50)" opacity="0.9" />
                  <circle cx="50" cy="50" r="20" fill="url(#pgCore)" />
                  <circle cx="50" cy="50" r="8" fill="#FFFFFF" />
                  <defs>
                    <linearGradient id="pgRing" x1="0" y1="0" x2="100" y2="100">
                      <stop offset="0%" stopColor="#4A90E2" />
                      <stop offset="100%" stopColor="#9013FE" />
                    </linearGradient>
                    <radialGradient id="pgCore" cx="50" cy="50" r="20" fx="50" fy="50">
                      <stop offset="0%" stopColor="#B388FF" />
                      <stop offset="100%" stopColor="#6200EA" />
                    </radialGradient>
                  </defs>
                </svg>
              </span>
              <span className="brand-word">Ryokai</span>
            </div>
            <p>Multi-tenant work governance. Clarity at every scope of work.</p>
          </div>
          <div className="foot-col">
            <h4>Product</h4>
            <a href="#workspace">Workspace</a>
            <a href="#governance">Governance</a>
            <a href="#workload">Workload</a>
            <a href="#capabilities">Capabilities</a>
          </div>
          <div className="foot-col">
            <h4>Company</h4>
            <a href="#">About</a>
            <a href="#">Privacy</a>
            <a href="#">Terms</a>
          </div>
          <div className="foot-col">
            <h4>Resources</h4>
            <a href="#">Docs</a>
            <a href="#">Status</a>
            <a href="mailto:sales@ryokai.dev">Contact</a>
          </div>
        </div>
        <div className="foot-bottom">
          <span>© 2026 Ryokai. All rights reserved.</span>
          <span>Personal · Org · Crews</span>
        </div>
      </div>
    </footer>
  );
}

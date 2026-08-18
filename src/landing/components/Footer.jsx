import React from 'react';
import { RyokaiMark } from './RyokaiMark';

export function Footer() {
  return (
    <footer>
      <div className="wrap">
        <div className="foot-grid">
          <div className="foot-brand">
            <div className="brand">
              <RyokaiMark size={22} />
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
            <h4>Resources</h4>
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

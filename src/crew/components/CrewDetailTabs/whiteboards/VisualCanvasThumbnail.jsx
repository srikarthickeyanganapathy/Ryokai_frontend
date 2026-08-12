// Custom Visual Canvas Thumbnail Renderers
export function VisualCanvasThumbnail({ board, templateId }) {
  if (board?.snapshotDataUrl || board?.snapshot || board?.thumbnailUrl) {
    return (
      <img 
        src={board.snapshotDataUrl || board.snapshot || board.thumbnailUrl} 
        alt={board.title} 
        className="w-full h-full object-cover" 
      />
    );
  }

  const effectiveTemplate = templateId || board?.template || 'blank';

  return (
    <div className="relative w-full h-full bg-[var(--bg-subtle)] overflow-hidden select-none">
      {/* Canvas Grid Background */}
      <div 
        className="absolute inset-0 opacity-40 pointer-events-none" 
        style={{ 
          backgroundImage: 'radial-gradient(var(--border-strong) 1px, transparent 1px)', 
          backgroundSize: '14px 14px' 
        }}
      />

      {/* Dynamic Graphic Preview by Template */}
      {effectiveTemplate === 'brainstorming' && (
        <svg className="w-full h-full p-3 opacity-90" viewBox="0 0 200 120" fill="none">
          <path d="M40 40 Q 90 20 140 35" stroke="var(--accent)" strokeWidth="1.5" strokeDasharray="3 3" />
          <path d="M40 40 Q 60 90 130 85" stroke="var(--warning)" strokeWidth="1.5" strokeDasharray="3 3" />
          {/* Sticky Notes */}
          <rect x="25" y="25" width="35" height="30" rx="3" fill="#FEF08A" stroke="#EAB308" strokeWidth="1" />
          <line x1="30" y1="33" x2="52" y2="33" stroke="#A16207" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="30" y1="41" x2="47" y2="41" stroke="#A16207" strokeWidth="1.5" strokeLinecap="round" />

          <rect x="125" y="20" width="38" height="32" rx="3" fill="#BAE6FD" stroke="#0284C7" strokeWidth="1" />
          <line x1="130" y1="29" x2="155" y2="29" stroke="#0369A1" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="130" y1="37" x2="150" y2="37" stroke="#0369A1" strokeWidth="1.5" strokeLinecap="round" />

          <rect x="115" y="70" width="40" height="32" rx="3" fill="#FBCFE8" stroke="#DB2777" strokeWidth="1" />
          <line x1="120" y1="79" x2="148" y2="79" stroke="#BE185D" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="120" y1="87" x2="142" y2="87" stroke="#BE185D" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      )}

      {effectiveTemplate === 'architecture' && (
        <svg className="w-full h-full p-3 opacity-90" viewBox="0 0 200 120" fill="none">
          <path d="M55 40 H100 V65 H145" stroke="var(--accent)" strokeWidth="1.5" markerEnd="url(#arrow)" />
          <path d="M100 65 V90 H145" stroke="var(--accent)" strokeWidth="1.5" />
          {/* Nodes */}
          <rect x="15" y="25" width="40" height="30" rx="4" fill="var(--bg-card)" stroke="var(--accent)" strokeWidth="1.5" />
          <rect x="20" y="32" width="20" height="4" rx="1" fill="var(--accent)" />
          <rect x="20" y="40" width="30" height="3" rx="1" fill="var(--text-tertiary)" />

          <rect x="80" y="50" width="40" height="30" rx="4" fill="var(--bg-card)" stroke="var(--success)" strokeWidth="1.5" />
          <rect x="85" y="57" width="22" height="4" rx="1" fill="var(--success)" />
          <rect x="85" y="65" width="28" height="3" rx="1" fill="var(--text-tertiary)" />

          <rect x="145" y="25" width="42" height="30" rx="4" fill="var(--bg-card)" stroke="var(--warning)" strokeWidth="1.5" />
          <rect x="150" y="32" width="24" height="4" rx="1" fill="var(--warning)" />

          <rect x="145" y="75" width="42" height="30" rx="4" fill="var(--bg-card)" stroke="var(--accent)" strokeWidth="1.5" />
          <rect x="150" y="82" width="20" height="4" rx="1" fill="var(--accent)" />
        </svg>
      )}

      {effectiveTemplate === 'retrospective' && (
        <svg className="w-full h-full p-2.5 opacity-90" viewBox="0 0 200 120" fill="none">
          {/* 3 Columns */}
          <rect x="15" y="15" width="50" height="90" rx="4" fill="rgba(16, 185, 129, 0.08)" stroke="rgba(16, 185, 129, 0.2)" strokeWidth="1" />
          <rect x="20" y="20" width="40" height="8" rx="2" fill="var(--success)" opacity="0.8" />
          <rect x="20" y="34" width="40" height="22" rx="2" fill="var(--bg-card)" stroke="var(--border-subtle)" strokeWidth="1" />
          <rect x="20" y="60" width="40" height="22" rx="2" fill="var(--bg-card)" stroke="var(--border-subtle)" strokeWidth="1" />

          <rect x="75" y="15" width="50" height="90" rx="4" fill="rgba(245, 158, 11, 0.08)" stroke="rgba(245, 158, 11, 0.2)" strokeWidth="1" />
          <rect x="80" y="20" width="40" height="8" rx="2" fill="var(--warning)" opacity="0.8" />
          <rect x="80" y="34" width="40" height="22" rx="2" fill="var(--bg-card)" stroke="var(--border-subtle)" strokeWidth="1" />

          <rect x="135" y="15" width="50" height="90" rx="4" fill="rgba(65, 105, 225, 0.08)" stroke="rgba(65, 105, 225, 0.2)" strokeWidth="1" />
          <rect x="140" y="20" width="40" height="8" rx="2" fill="var(--accent)" opacity="0.8" />
          <rect x="140" y="34" width="40" height="22" rx="2" fill="var(--bg-card)" stroke="var(--border-subtle)" strokeWidth="1" />
          <rect x="140" y="60" width="40" height="22" rx="2" fill="var(--bg-card)" stroke="var(--border-subtle)" strokeWidth="1" />
        </svg>
      )}

      {effectiveTemplate === 'user-journey' && (
        <svg className="w-full h-full p-3 opacity-90" viewBox="0 0 200 120" fill="none">
          <path d="M25 60 C 60 20, 100 90, 175 40" stroke="var(--accent)" strokeWidth="2" strokeDasharray="4 2" />
          {/* Step circles */}
          <circle cx="25" cy="60" r="8" fill="var(--accent)" />
          <circle cx="75" cy="38" r="8" fill="var(--success)" />
          <circle cx="125" cy="72" r="8" fill="var(--warning)" />
          <circle cx="175" cy="40" r="8" fill="var(--accent)" />

          <rect x="15" y="75" width="20" height="12" rx="2" fill="var(--bg-card)" stroke="var(--border-subtle)" />
          <rect x="65" y="52" width="20" height="12" rx="2" fill="var(--bg-card)" stroke="var(--border-subtle)" />
          <rect x="115" y="86" width="20" height="12" rx="2" fill="var(--bg-card)" stroke="var(--border-subtle)" />
          <rect x="165" y="54" width="20" height="12" rx="2" fill="var(--bg-card)" stroke="var(--border-subtle)" />
        </svg>
      )}

      {effectiveTemplate === 'blank' && (
        <svg className="w-full h-full p-4 opacity-75" viewBox="0 0 200 120" fill="none">
          <path d="M30 40 Q 60 10 90 40 T 150 40" stroke="var(--text-tertiary)" strokeWidth="1.5" fill="none" />
          <rect x="40" y="60" width="45" height="35" rx="3" stroke="var(--accent)" strokeWidth="1.5" strokeDasharray="2 2" fill="none" />
          <circle cx="140" cy="75" r="16" stroke="var(--success)" strokeWidth="1.5" fill="none" />
        </svg>
      )}
    </div>
  );
}

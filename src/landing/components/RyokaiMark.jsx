export function RyokaiMark({ size = 24, style, className }) {
  return (
    <span className={`mark ${className || ''}`} style={{ width: size, height: size, ...style }}>
      <svg viewBox="0 0 100 100" fill="none" style={{ width: size * (17/24), height: size * (17/24) }}>
        <defs>
          <radialGradient id="pgCore" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFFFFF"/><stop offset="30%" stopColor="#E0F2FE"/><stop offset="65%" stopColor="#0284C7" stopOpacity="0.8"/><stop offset="100%" stopColor="#030712" stopOpacity="0"/>
          </radialGradient>
          <radialGradient id="pgRing" cx="50%" cy="50%" r="50%">
            <stop offset="35%" stopColor="#00F0FF" stopOpacity="0"/><stop offset="70%" stopColor="#38BDF8" stopOpacity="0.95"/><stop offset="88%" stopColor="#0284C7" stopOpacity="0.7"/><stop offset="100%" stopColor="#030712" stopOpacity="0"/>
          </radialGradient>
        </defs>
        <ellipse cx="50" cy="50" rx="44" ry="24" stroke="url(#pgRing)" strokeWidth="8" transform="rotate(-22 50 50)" opacity="0.9" />
        <ellipse cx="50" cy="50" rx="38" ry="20" stroke="#00F0FF" strokeWidth="2" strokeDasharray="4 5" transform="rotate(-22 50 50)" opacity="0.7" />
        <circle cx="50" cy="50" r="22" fill="url(#pgCore)" />
        <circle cx="50" cy="50" r="9" fill="#E0F2FE" />
        <circle cx="50" cy="50" r="5" fill="#FFFFFF" />
      </svg>
    </span>
  );
}

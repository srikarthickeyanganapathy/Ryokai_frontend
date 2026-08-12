export function Sparkline({ data, color = 'var(--accent)' }) {
  if (!data || data.length === 0) return null;
  const max = Math.max(...data, 1);
  const width = 60;
  const height = 20;
  const points = data
    .map((d, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - (d / max) * height;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <svg width={width} height={height} viewBox="0 0 60 20" fill="none">
      <polyline
        points={points}
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

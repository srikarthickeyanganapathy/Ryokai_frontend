import { HelixGalaxyMark } from '@/shared/ui/Logo/HelixGalaxyMark'

export function RyokaiMark({ size = 28, style, className }) {
  return (
    <span className={`mark ${className || ''}`} style={{ width: size, height: size, ...style }}>
      <HelixGalaxyMark style={{ width: '100%', height: '100%' }} />
    </span>
  );
}

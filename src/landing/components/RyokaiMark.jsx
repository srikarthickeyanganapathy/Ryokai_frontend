import { RyokaiSealMark } from '@/shared/ui/Logo/RyokaiSealMark'

export function RyokaiMark({ size = 28, style, className }) {
  return (
    <span className={`mark ${className || ''}`} style={{ width: size, height: size, ...style }}>
      <RyokaiSealMark style={{ width: '100%', height: '100%' }} />
    </span>
  );
}

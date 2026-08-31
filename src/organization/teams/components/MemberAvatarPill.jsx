import React from 'react'
import { hashHue } from './utils'

/* ===
 * MEMBER AVATAR PILL (extracted from TeamsPage)
 * === */

export function MemberAvatarPill({ member, index }) {
  const mHue = hashHue(member.username || String(index))
  return (
    <div
      title={member.username}
      className="w-6 h-6 rounded-full ring-2 ring-[var(--bg-card)] flex items-center justify-center text-[9px] font-semibold text-white shrink-0"
      style={{ background: `hsl(${mHue} 55% 48%)`, zIndex: 4 - index }}
    >
      {member.username?.charAt(0).toUpperCase()}
    </div>
  )
}

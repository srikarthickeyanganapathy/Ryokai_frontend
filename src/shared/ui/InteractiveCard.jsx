import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/shared/lib/cn';

/**
 * InteractiveCard — Premium card with Linear-style micro-interactions.
 * 
 * Features:
 *   - Subtle border glow on hover (Fitts's Law: larger visual affordance)
 *   - 1px Y-translate lift (Doherty Threshold: instant visual feedback)
 *   - Scale-on-press (Aesthetic-Usability Effect)
 *   - Accent left-border option for status coding (Von Restorff Effect)
 *   - Children stagger animation
 */

const cardSpring = { type: 'spring', stiffness: 400, damping: 25 };

export function InteractiveCard({
  children,
  className,
  variant = 'default',
  onClick,
  accent,
  ...props
}) {
  const variants = {
    default: {
      rest: { y: 0, boxShadow: 'var(--shadow-sm)' },
      hover: { y: -1, boxShadow: 'var(--shadow-md), 0 0 0 1px var(--accent-border)' },
      tap: { y: 0, scale: 0.995 }
    },
    glass: {
      rest: { y: 0 },
      hover: { y: -1, boxShadow: 'var(--shadow-lg)' },
      tap: { y: 0, scale: 0.995 }
    },
    flat: {
      rest: { y: 0 },
      hover: { y: 0, backgroundColor: 'var(--bg-hover)' },
      tap: { scale: 0.995 }
    }
  };

  const baseStyles = cn(
    'rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] relative overflow-hidden cursor-pointer',
    onClick && 'cursor-pointer'
  );

  const accentBorder = variant === 'default' && accent && `border-l-[3px] border-l-${accent}`;

  return (
    <motion.div
      variants={variants[variant] || variants.default}
      initial="rest"
      whileHover="hover"
      whileTap="tap"
      transition={cardSpring}
      className={cn(baseStyles, accentBorder, className)}
      onClick={onClick}
      {...props}
    >
      {children}
    </motion.div>
  );
}

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/shared/lib/cn';

/**
 * InlineEditable -- Linear-style click-to-edit cell.
 * ---
 * Click text to enter edit mode, hit Enter to save, Esc to cancel,
 * click outside to blur-save. Instant feedback -- no modal overhead.
 *
 * Usage:
 *   <InlineEditable
 *     value={task.title}
 *     onSave={(newValue) => updateTask(task.id, { title: newValue })}
 *     placeholder="Untitled"
 *   />
 *
 * UX Laws:
 *   - Fitts's Law: full-width click target (no tiny edit button)
 *   - Doherty Threshold: instant transition (150ms)
 *   - Jakob's Law: same pattern as Linear, Notion, Jira
 */

export function InlineEditable({
  value = '',
  onSave,
  placeholder = 'Untitled',
  disabled = false,
  className,
  truncate = false,
  inputClassName,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const inputRef = useRef(null);

  // Auto-focus input on edit
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleStartEdit = useCallback(() => {
    if (disabled) return;
    setIsEditing(true);
    setEditValue(value);
  }, [disabled, value]);

  const handleSave = useCallback(() => {
    setIsEditing(false);
    const trimmed = editValue.trim();
    if (trimmed !== value && onSave) {
      onSave(trimmed || value);
    } else {
      setEditValue(value);
    }
  }, [editValue, value, onSave]);

  const handleCancel = useCallback(() => {
    setIsEditing(false);
    setEditValue(value);
  }, [value]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  }, [handleSave, handleCancel]);

  if (isEditing) {
    return (
      <motion.input
        ref={inputRef}
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.15 }}
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={cn(
          'w-full bg-[var(--bg-subtle)] border border-[var(--accent)] rounded-md px-2 py-0.5 text-[13px] font-medium',
          'text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)]',
          'focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20',
          inputClassName
        )}
        onClick={(e) => e.stopPropagation()}
      />
    );
  }

  return (
    <button
      type="button"
      onClick={(e) => { e.stopPropagation(); handleStartEdit(); }}
      disabled={disabled}
      className={cn(
        'w-full text-left text-[13px] font-medium cursor-text',
        'text-[var(--text-primary)] rounded-md px-0.5 -mx-0.5 py-0.5',
        'hover:bg-[var(--bg-subtle)] border border-transparent hover:border-[var(--border-subtle)]',
        'transition-colors duration-100',
        disabled && 'cursor-default hover:bg-transparent hover:border-transparent',
        truncate && 'truncate',
        className
      )}
      title={value || placeholder}
    >
      {value || <span className="text-[var(--text-tertiary)] italic">{placeholder}</span>}
    </button>
  );
}

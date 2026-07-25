import React from 'react';
import { Bookmark } from 'lucide-react';
import { useSaveState } from '../hooks/useSaved';
import { Button } from '@/shared/ui/Button';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/shared/ui/Tooltip';
import { cn } from '@/shared/lib/cn';

export function SaveToggle({ 
  entityType, 
  entityId, 
  variant = 'icon', // 'icon', 'menuItem', 'button'
  size = 'icon',
  disabled = false,
  className 
}) {
  const { isSaved, toggle, isPending } = useSaveState(entityType, entityId);
  const isDisabled = disabled || isPending;

  const handleToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDisabled) toggle();
  };

  const label = isSaved ? 'Remove bookmark' : 'Bookmark item';
  const iconProps = {
    className: cn("w-4 h-4 transition-transform", isSaved && "text-[var(--accent)]"),
    fill: isSaved ? "currentColor" : "none"
  };

  let content;

  if (variant === 'menuItem') {
    content = (
      <button
        onClick={handleToggle}
        disabled={isDisabled}
        className={cn(
          "w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded-md transition-colors",
          isSaved ? "text-[var(--accent)]" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]",
          isDisabled && "opacity-50 cursor-not-allowed",
          className
        )}
        aria-label={label}
        aria-pressed={isSaved}
      >
        <Bookmark {...iconProps} />
        <span>{isSaved ? 'Unsave' : 'Save'}</span>
      </button>
    );
  } else if (variant === 'button') {
    content = (
      <Button
        variant="outline"
        size={size === 'icon' ? 'default' : size}
        onClick={handleToggle}
        disabled={isDisabled}
        className={cn(
          "gap-2",
          isSaved && "border-[var(--accent-border)] text-[var(--accent)] bg-[var(--accent-soft)] hover:bg-[var(--accent-soft)] hover:text-[var(--accent)]",
          className
        )}
        aria-label={label}
        aria-pressed={isSaved}
      >
        <Bookmark {...iconProps} />
        <span>{isSaved ? 'Saved' : 'Save'}</span>
      </Button>
    );
  } else {
    // default: 'icon'
    content = (
      <Button
        variant="ghost"
        size={size}
        onClick={handleToggle}
        disabled={isDisabled}
        className={cn(
          isSaved ? "text-[var(--accent)] hover:bg-[var(--accent-soft)] hover:text-[var(--accent)]" : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]",
          className
        )}
        aria-label={label}
        aria-pressed={isSaved}
      >
        <Bookmark {...iconProps} className={cn(iconProps.className, isPending && "opacity-50")} />
      </Button>
    );
  }

  // Only wrap with tooltip for icon variant or if explicitly wrapped.
  if (variant === 'icon') {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          {content}
        </TooltipTrigger>
        <TooltipContent>
          {label}
        </TooltipContent>
      </Tooltip>
    );
  }

  return content;
}

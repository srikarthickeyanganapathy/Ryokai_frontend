import React from 'react';
import { Button } from '@/shared/ui/Button';
import { Paperclip, Smile, Send } from '@/shared/ui/Icons';

/* Message input box with attach / emoji / send controls. */
export function MessageComposer({ value, onChange, onSubmit, placeholder, isSending, canSend }) {
  return (
    <form onSubmit={onSubmit} className="relative">
      <div className="relative flex items-center bg-[var(--bg-subtle)] border border-[var(--border-subtle)] rounded-xl focus-within:ring-2 focus-within:ring-[var(--accent)]/20 focus-within:border-[var(--accent-border)] transition-all">
        <div className="pl-3">
          <button type="button" className="p-1 rounded-md text-[var(--text-muted)] hover:text-[var(--accent)] hover:bg-[var(--accent-soft)] transition-colors" title="Attach file">
            <Paperclip className="w-4 h-4" />
          </button>
        </div>
        <input 
          value={value} 
          onChange={onChange} 
          placeholder={placeholder} 
          className="w-full pl-2 pr-24 py-2.5 bg-transparent text-[13px] font-medium focus:outline-none placeholder:text-[var(--text-muted)] text-[var(--text-primary)]" 
        />
        <button type="button" className="absolute right-10 text-[var(--text-muted)] hover:text-[var(--accent)] hover:bg-[var(--accent-soft)] transition-colors p-1 rounded-md" title="Insert emoji">
          <Smile className="w-4 h-4" />
        </button>
        <Button 
          type="submit" 
          size="sm" 
          className="absolute right-1.5 top-1/2 -translate-y-1/2 h-7.5 w-7.5 p-0 shadow-sm" 
          isLoading={isSending}
          disabled={!canSend}
        >
          <Send className="w-3.5 h-3.5" />
        </Button>
      </div>
    </form>
  );
}

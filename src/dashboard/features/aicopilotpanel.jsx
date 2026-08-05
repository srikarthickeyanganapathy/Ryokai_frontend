import React, { useState } from 'react';
import { PremiumCard, PremiumCardHeader, PremiumCardTitle, PremiumCardContent } from '@/shared/ui/PremiumCard';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { Sparkles, Zap, Brain, ArrowRight, RefreshCw, Icons } from '@/shared/ui/Icons';
import { useCopilotInsights, useCopilotQuestions } from './hooks/useAICopilot';
import { useQueryClient } from '@tanstack/react-query';

export function AICopilotPanel() {
  const [copilotInput, setCopilotInput] = useState('');
  
  const { data: insightsData, isLoading: insightsLoading } = useCopilotInsights();
  const { data: questionsData, isLoading: questionsLoading } = useCopilotQuestions();
  const queryClient = useQueryClient();

  const insights = insightsData || [];
  const questions = questionsData || [];

  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['copilot', 'insights'] }),
      queryClient.invalidateQueries({ queryKey: ['copilot', 'questions'] })
    ]);
    setIsRefreshing(false);
  };

  const handleAsk = (question) => {
    setCopilotInput(question);
    // Future: trigger AI request
  };

  const toneStyles = {
    warning: 'border-l-[var(--warning)] bg-[var(--warning-soft)]/10',
    success: 'border-l-[var(--success)] bg-[var(--success-soft)]/10',
    accent: 'border-l-[var(--accent)] bg-[var(--accent-soft)]/20',
  };

  return (
    <PremiumCard variant="glass" className="overflow-hidden">
      <PremiumCardHeader>
        <PremiumCardTitle icon={Brain}>
          AI Copilot
        </PremiumCardTitle>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="p-1.5 rounded-lg hover:bg-[var(--bg-hover)] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors disabled:opacity-50"
          title="Refresh insights"
        >
          <RefreshCw className={isRefreshing ? 'animate-spin' : ''} size={14} />
        </button>
      </PremiumCardHeader>

      <PremiumCardContent>
        {/* Quick Ask Bar */}
        <div className="flex items-center gap-2 mb-4">
          <div className="relative flex-1">
            <Sparkles className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--accent)]" />
            <Input
              placeholder="Ask Copilot anything..."
              value={copilotInput}
              onChange={(e) => setCopilotInput(e.target.value)}
              className="pl-9 pr-3 h-9 text-xs bg-[var(--bg-base)] border-[var(--border-default)] rounded-xl focus:border-[var(--accent)] focus:shadow-[0_0_0_2px_var(--accent-border)]"
            />
          </div>
          <Button
            size="icon"
            variant="primary"
            className="h-9 w-9 rounded-xl shrink-0"
            title="Ask"
          >
            <Zap size={14} />
          </Button>
        </div>

        {/* Suggested Questions */}
        {!questionsLoading && questions.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {questions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleAsk(q)}
                className="px-2.5 py-1 rounded-full text-[10px] font-medium text-[var(--text-secondary)] bg-[var(--bg-subtle)] border border-[var(--border-subtle)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] hover:border-[var(--accent-border)] transition-all"
              >
                {q}
              </button>
            ))}
          </div>
        )}

        {/* Insights Feed */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 mb-2">
            <span className="text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">
              Insights
            </span>
            <span className="h-px flex-1 bg-[var(--border-subtle)]" />
          </div>
          
          {insightsLoading && <div className="text-xs text-center text-[var(--text-muted)] py-4">Loading insights...</div>}
          
          {!insightsLoading && insights.length === 0 && (
             <div className="text-xs text-center text-[var(--text-muted)] py-4">No new insights right now.</div>
          )}

          {!insightsLoading && insights.map((insight) => {
            // Assume backend returns icon as string name matching Icons object
            const Icon = Icons[insight.icon] || Sparkles; 
            const toneClass = toneStyles[insight.tone] || toneStyles.accent;
            return (
              <div
                key={insight.id}
                className={`p-3 rounded-xl border border-[var(--border-subtle)] cursor-pointer transition-all hover:shadow-md hover:-translate-y-[0.5px] ${toneClass}`}
              >
                <div className="flex items-start gap-2.5">
                  <Icon className="h-4 w-4 text-[var(--accent)] shrink-0 mt-0.5" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-[var(--text-primary)] mb-0.5">
                      {insight.title}
                    </p>
                    <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                      {insight.description}
                    </p>
                    <button className="flex items-center gap-1 mt-1.5 text-[10px] font-medium text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors">
                      {insight.action}
                      <ArrowRight size={10} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </PremiumCardContent>
    </PremiumCard>
  );
}

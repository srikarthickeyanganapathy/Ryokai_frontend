import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/ui/Card';
import { useQuery } from '@tanstack/react-query';
import api from '@/shared/api/api';
import { queryKeys } from '@/shared/api/queryKeys';
import { Calendar, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function CalendarWidget() {
  const navigate = useNavigate();
  const today = new Date().toISOString().split('T')[0];
  const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const { data: events = [], isLoading } = useQuery({
    queryKey: queryKeys.calendarEvents.range(today, nextWeek),
    queryFn: async () => {
      try {
        const startDateTime = `${today}T00:00:00`;
        const endDateTime = `${nextWeek}T23:59:59`;
        const res = await api.get('/calendar-events', { 
          params: { start: startDateTime, end: endDateTime } 
        });
        return Array.isArray(res.data) ? res.data : res.data?.content || [];
      } catch (err) {
        // Fallback for when backend calendar API is not yet implemented
        return [];
      }
    }
  });

  return (
    <Card className="group">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Calendar className="h-4 w-4 text-[var(--accent)]" />
            Upcoming Events
          </CardTitle>
          <button 
            onClick={() => navigate('/app/calendar')}
            className="text-xs text-[var(--text-tertiary)] hover:text-[var(--accent)] flex items-center gap-1 transition-colors"
          >
            View All <ArrowRight className="h-3 w-3" />
          </button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {isLoading ? (
          <div className="space-y-2">
            {[1,2].map(i => (
              <div key={i} className="h-8 rounded-lg bg-[var(--bg-subtle)] animate-pulse" />
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-4">
            <Calendar className="h-8 w-8 mx-auto text-[var(--text-tertiary)] mb-2 opacity-40" />
            <p className="text-xs text-[var(--text-tertiary)]">No events this week</p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {events.slice(0, 4).map(event => (
              <div key={event.id} className="flex items-start gap-2.5 px-3 py-2 rounded-lg hover:bg-[var(--bg-hover)] cursor-pointer transition-colors">
                <div className="w-8 text-center shrink-0 mt-0.5">
                  <p className="text-[10px] text-[var(--text-tertiary)] uppercase font-medium">
                    {new Date(event.startTime).toLocaleDateString('en-US', { month: 'short' })}
                  </p>
                  <p className="text-sm font-bold text-[var(--text-primary)] leading-none">
                    {new Date(event.startTime).getDate()}
                  </p>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-[var(--text-primary)] truncate">{event.title}</p>
                  <p className="text-[10px] text-[var(--text-tertiary)]">
                    {new Date(event.startTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

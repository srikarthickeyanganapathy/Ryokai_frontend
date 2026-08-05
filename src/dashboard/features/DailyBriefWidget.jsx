import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/ui/Card';
import { CheckCircle, Clock, Calendar, Zap } from '@/shared/ui/Icons';

export function DailyBriefWidget({ context }) {
  if (!context?.dailyBrief) return null;
  const { dailyBrief } = context;

  return (
    <Card className="w-full bg-gradient-to-br from-background to-muted/30 border-muted/50 mb-6">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-bold flex items-center gap-2">
          {dailyBrief.greeting}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-6 mt-4">
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span>{dailyBrief.focusTasksCount} Focus Tasks</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4 text-amber-500" />
            <span>{dailyBrief.remindersCount} Reminders</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-blue-500" />
            <span>{dailyBrief.meetingsCount} Meetings</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Zap className="w-4 h-4 text-purple-500" />
            <span>{dailyBrief.streakMessage}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

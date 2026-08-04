import React from 'react';
import AnnouncementsWidget from './widgets/AnnouncementsWidget';
import GoalsWidget from './widgets/GoalsWidget';
import MembersWidget from './widgets/MembersWidget';
import TeamsWidget from './widgets/TeamsWidget';
import LeaveWidget from './widgets/LeaveWidget';
import TimelineWidget from './widgets/TimelineWidget';
import HealthWidget from './widgets/HealthWidget';

export default function MissionControl() {
  return (
    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>Mission Control</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '24px' }}>
        {/* Top Row: Health & Announcements */}
        <div style={{ gridColumn: 'span 8' }}>
          <HealthWidget />
        </div>
        <div style={{ gridColumn: 'span 4' }}>
          <AnnouncementsWidget />
        </div>

        {/* Middle Row: Goals, Teams, Members */}
        <div style={{ gridColumn: 'span 4' }}>
          <GoalsWidget />
        </div>
        <div style={{ gridColumn: 'span 4' }}>
          <TeamsWidget />
        </div>
        <div style={{ gridColumn: 'span 4' }}>
          <MembersWidget />
        </div>

        {/* Bottom Row: Timeline & Leave */}
        <div style={{ gridColumn: 'span 6' }}>
          <TimelineWidget />
        </div>
        <div style={{ gridColumn: 'span 6' }}>
          <LeaveWidget />
        </div>
      </div>
    </div>
  );
}

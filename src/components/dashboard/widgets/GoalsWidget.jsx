import React from 'react';

const goals = [
  { id: 1, title: 'Launch Q3 Campaign', progress: 75, krs: 3 },
  { id: 2, title: 'Hire 5 Engineers', progress: 40, krs: 2 },
];

export default function GoalsWidget() {
  return (
    <div style={{ border: '1px solid #eaeaea', borderRadius: '8px', padding: '16px', background: '#fff', height: '100%' }}>
      <h3 style={{ margin: '0 0 16px 0', fontSize: '16px' }}>Active Goals</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {goals.map(goal => (
          <div key={goal.id}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ fontSize: '14px', fontWeight: '500' }}>{goal.title}</span>
              <span style={{ fontSize: '12px', color: '#666' }}>{goal.krs} KRs</span>
            </div>
            <div style={{ width: '100%', background: '#eee', borderRadius: '4px', height: '8px', overflow: 'hidden' }}>
              <div style={{ width: `${goal.progress}%`, background: '#0070f3', height: '100%' }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

import React from 'react';

const teams = [
  { id: 1, name: 'Engineering', lead: 'Alice', count: 12 },
  { id: 2, name: 'Design', lead: 'Bob', count: 5 },
];

export default function TeamsWidget() {
  return (
    <div style={{ border: '1px solid #eaeaea', borderRadius: '8px', padding: '16px', background: '#fff', height: '100%' }}>
      <h3 style={{ margin: '0 0 16px 0', fontSize: '16px' }}>Teams Overview</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {teams.map(team => (
          <div key={team.id} style={{ padding: '12px', border: '1px solid #f0f0f0', borderRadius: '6px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: '600', fontSize: '14px' }}>{team.name}</span>
              <span style={{ fontSize: '12px', background: '#f5f5f5', padding: '2px 8px', borderRadius: '12px' }}>{team.count} members</span>
            </div>
            <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>Lead: {team.lead}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

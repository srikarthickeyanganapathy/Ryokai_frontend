import React from 'react';

const requests = [
  { id: 1, name: 'Alice', type: 'Leave', days: 3, status: 'pending' },
  { id: 2, name: 'Charlie', type: 'Exit', days: 1, status: 'pending' }
];

export default function LeaveWidget() {
  return (
    <div style={{ border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md, 8px)', padding: '16px', background: 'var(--bg-card)', height: '100%' }}>
      <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', color: 'var(--text-primary)' }}>Pending Requests</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {requests.map(req => (
          <div key={req.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm, 4px)' }}>
            <div>
              <div style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text-primary)' }}>{req.name}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{req.type} ({req.days} days)</div>
            </div>
            <div style={{ display: 'flex', gap: '4px' }}>
              <button style={{ padding: '4px 8px', background: 'var(--success)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>✓</button>
              <button style={{ padding: '4px 8px', background: 'var(--danger)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>✕</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

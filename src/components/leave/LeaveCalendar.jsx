import React from 'react';

const requests = [
  { id: 1, name: 'Alice', type: 'Leave', status: 'APPROVED', workingDays: 3, date: '2026-08-15' },
  { id: 2, name: 'Bob', type: 'Exit', status: 'PENDING', workingDays: 0, date: '2026-08-20' },
  { id: 3, name: 'Charlie', type: 'Leave', status: 'REJECTED', workingDays: 5, date: '2026-08-25' }
];

export default function LeaveCalendar() {
  const getBadgeColor = (status) => {
    if (status === 'APPROVED') return '#10b981';
    if (status === 'PENDING') return '#f59e0b';
    if (status === 'REJECTED') return '#ef4444';
    return '#666';
  };

  return (
    <div style={{ padding: '24px', background: '#fff', borderRadius: '8px', border: '1px solid #eaeaea' }}>
      <h2 style={{ fontSize: '20px', marginBottom: '16px' }}>Leave & Exit Calendar</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px' }}>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} style={{ textAlign: 'center', fontWeight: 'bold', padding: '8px', background: '#f3f4f6' }}>{day}</div>
        ))}
        {/* Mock Calendar Grid for August 2026 */}
        {Array.from({ length: 31 }).map((_, i) => {
          const dayReqs = requests.filter(r => r.date === `2026-08-${String(i + 1).padStart(2, '0')}`);
          return (
            <div key={i} style={{ minHeight: '80px', padding: '8px', border: '1px solid #eee', background: dayReqs.length ? '#fdf8f6' : '#fff' }}>
              <div style={{ fontSize: '12px', color: '#888', marginBottom: '4px' }}>{i + 1}</div>
              {dayReqs.map(req => (
                <div key={req.id} style={{ fontSize: '11px', padding: '4px', marginBottom: '4px', borderRadius: '4px', background: getBadgeColor(req.status), color: '#fff' }}>
                  <strong>{req.name}</strong> - {req.type}
                  <div style={{ fontSize: '10px', marginTop: '2px' }}>{req.workingDays} working days</div>
                  {req.status === 'PENDING' && (
                    <div style={{ display: 'flex', gap: '2px', marginTop: '4px' }}>
                      <button style={{ flex: 1, padding: '2px', fontSize: '10px', background: '#fff', color: '#000', border: 'none', borderRadius: '2px', cursor: 'pointer' }}>Approve</button>
                      <button style={{ flex: 1, padding: '2px', fontSize: '10px', background: '#fff', color: '#000', border: 'none', borderRadius: '2px', cursor: 'pointer' }}>Reject</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

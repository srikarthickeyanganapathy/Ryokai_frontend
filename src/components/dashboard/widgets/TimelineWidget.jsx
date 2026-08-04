import React from 'react';

const events = [
  { id: 1, text: 'Alice completed KR: User Onboarding', time: '10 mins ago' },
  { id: 2, text: 'Bob joined the Engineering team', time: '1 hour ago' },
  { id: 3, text: 'Leave request approved for Charlie', time: '2 hours ago' }
];

export default function TimelineWidget() {
  return (
    <div style={{ border: '1px solid #eaeaea', borderRadius: '8px', padding: '16px', background: '#fff', height: '100%' }}>
      <h3 style={{ margin: '0 0 16px 0', fontSize: '16px' }}>Activity Feed</h3>
      <div style={{ position: 'relative', paddingLeft: '16px' }}>
        <div style={{ position: 'absolute', left: '6px', top: 0, bottom: 0, width: '2px', background: '#eaeaea' }} />
        {events.map(event => (
          <div key={event.id} style={{ position: 'relative', marginBottom: '16px' }}>
            <div style={{ position: 'absolute', left: '-14px', top: '4px', width: '8px', height: '8px', borderRadius: '50%', background: '#0070f3' }} />
            <div style={{ fontSize: '14px' }}>{event.text}</div>
            <div style={{ fontSize: '12px', color: '#888' }}>{event.time}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

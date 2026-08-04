import React, { useState } from 'react';

const announcements = [
  { id: 1, title: 'Q3 Townhall Meeting', type: 'Event', date: '2026-08-10' },
  { id: 2, title: 'New Remote Work Policy', type: 'Policy', date: '2026-08-05' },
];

export default function AnnouncementsWidget() {
  const [index, setIndex] = useState(0);

  return (
    <div style={{ border: '1px solid #eaeaea', borderRadius: '8px', padding: '16px', background: '#fff', height: '100%' }}>
      <h3 style={{ margin: '0 0 16px 0', fontSize: '16px' }}>Announcements</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {announcements.map((a, i) => (
          <div key={a.id} style={{ display: i === index ? 'block' : 'none', padding: '12px', background: '#f9f9f9', borderRadius: '6px' }}>
            <span style={{ fontSize: '12px', background: '#0070f3', color: '#fff', padding: '2px 6px', borderRadius: '4px' }}>{a.type}</span>
            <h4 style={{ margin: '8px 0 4px' }}>{a.title}</h4>
            <p style={{ fontSize: '12px', color: '#666', margin: 0 }}>{a.date}</p>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
        <button onClick={() => setIndex((index - 1 + announcements.length) % announcements.length)} style={{ padding: '4px 8px', cursor: 'pointer' }}>Prev</button>
        <button onClick={() => setIndex((index + 1) % announcements.length)} style={{ padding: '4px 8px', cursor: 'pointer' }}>Next</button>
      </div>
    </div>
  );
}

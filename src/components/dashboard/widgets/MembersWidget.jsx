import React from 'react';

const members = [
  { id: 1, name: 'Alice', role: 'Admin', status: 'online' },
  { id: 2, name: 'Bob', role: 'Member', status: 'offline' },
  { id: 3, name: 'Charlie', role: 'Observer', status: 'online' }
];

export default function MembersWidget() {
  const openInspector = (type, data) => {
    console.log('Inspector opened for:', type, data);
    // integrate with actual inspector context here
  };

  return (
    <div style={{ border: '1px solid #eaeaea', borderRadius: '8px', padding: '16px', background: '#fff', height: '100%' }}>
      <h3 style={{ margin: '0 0 16px 0', fontSize: '16px' }}>Members Online</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(40px, 1fr))', gap: '12px' }}>
        {members.map(m => (
          <div 
            key={m.id} 
            onClick={() => openInspector('member', m)}
            style={{ 
              width: '40px', height: '40px', borderRadius: '50%', background: '#eee', 
              display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
              position: 'relative'
            }}
            title={`${m.name} (${m.role})`}
          >
            {m.name[0]}
            <div style={{
              position: 'absolute', bottom: 0, right: 0, width: '10px', height: '10px',
              borderRadius: '50%', background: m.status === 'online' ? '#10b981' : '#9ca3af',
              border: '2px solid #fff'
            }} />
          </div>
        ))}
      </div>
    </div>
  );
}

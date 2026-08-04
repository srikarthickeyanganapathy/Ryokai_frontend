import React, { useState } from 'react';

const mockInvites = [
  { id: 1, email: 'newhire@example.com', status: 'Pending' },
  { id: 2, email: 'accepted@example.com', status: 'Accepted' },
  { id: 3, email: 'expired@example.com', status: 'Expired' }
];

export default function InviteCenter() {
  const [activeTab, setActiveTab] = useState('Pending');
  const [shareLink] = useState('https://ryokai.app/invite/abc-123');

  const filteredInvites = mockInvites.filter(i => i.status === activeTab);

  const copyLink = () => {
    navigator.clipboard.writeText(shareLink);
    alert('Link copied!');
  };

  return (
    <div style={{ padding: '24px', background: '#fff', borderRadius: '8px', border: '1px solid #eaeaea' }}>
      <h2 style={{ fontSize: '20px', marginBottom: '16px' }}>Invite Center</h2>
      
      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
        <div style={{ flex: 1, padding: '16px', border: '1px solid #ddd', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Share Link</div>
            <code style={{ background: '#f5f5f5', padding: '4px 8px', borderRadius: '4px', fontSize: '14px' }}>{shareLink}</code>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={copyLink} style={{ padding: '8px 16px', background: '#0070f3', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Copy</button>
            <button style={{ padding: '8px 16px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>QR Code</button>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid #eee', marginBottom: '16px' }}>
        {['Pending', 'Accepted', 'Expired'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{ 
              padding: '8px 16px', 
              border: 'none', 
              background: 'none', 
              cursor: 'pointer',
              borderBottom: activeTab === tab ? '2px solid #0070f3' : '2px solid transparent',
              color: activeTab === tab ? '#0070f3' : '#666',
              fontWeight: activeTab === tab ? 'bold' : 'normal'
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {filteredInvites.length > 0 ? filteredInvites.map(invite => (
          <div key={invite.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', border: '1px solid #eee', borderRadius: '4px' }}>
            <span>{invite.email}</span>
            <span style={{ fontSize: '12px', background: '#f5f5f5', padding: '2px 8px', borderRadius: '12px' }}>{invite.status}</span>
          </div>
        )) : (
          <div style={{ color: '#888', padding: '16px', textAlign: 'center' }}>No {activeTab.toLowerCase()} invites.</div>
        )}
      </div>
    </div>
  );
}

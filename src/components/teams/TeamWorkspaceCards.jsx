import React, { useState } from 'react';

const teams = [
  { id: 1, name: 'Frontend Guild', lead: 'Alice', members: ['Alice', 'Bob', 'Charlie'], observers: ['Dave'] },
  { id: 2, name: 'Backend Masters', lead: 'Eve', members: ['Eve', 'Frank'], observers: [] }
];

export default function TeamWorkspaceCards() {
  const [expanded, setExpanded] = useState(null);

  const openChat = (teamName) => {
    alert(`Opening Slack-lite chat for ${teamName}`);
  };

  return (
    <div style={{ padding: '24px' }}>
      <h2 style={{ fontSize: '20px', marginBottom: '16px' }}>Team Workspaces</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
        {teams.map(team => (
          <div key={team.id} style={{ border: '1px solid #eaeaea', borderRadius: '8px', background: '#fff', overflow: 'hidden' }}>
            <div 
              style={{ padding: '16px', borderBottom: '1px solid #eee', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              onClick={() => setExpanded(expanded === team.id ? null : team.id)}
            >
              <h3 style={{ margin: 0, fontSize: '16px' }}>{team.name}</h3>
              <span>{expanded === team.id ? '▲' : '▼'}</span>
            </div>
            
            {expanded === team.id && (
              <div style={{ padding: '16px' }}>
                <div style={{ marginBottom: '12px' }}><strong>Lead:</strong> {team.lead}</div>
                <div style={{ marginBottom: '12px' }}>
                  <strong>Members:</strong> {team.members.join(', ')}
                </div>
                {team.observers.length > 0 && (
                  <div style={{ marginBottom: '12px', color: '#666' }}>
                    <strong>Observers:</strong> {team.observers.join(', ')}
                  </div>
                )}
                <button 
                  onClick={() => openChat(team.name)}
                  style={{ width: '100%', padding: '8px', background: '#0070f3', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                  Open Team Chat
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

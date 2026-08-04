import React, { useState } from 'react';

const orgData = {
  id: 'root',
  name: 'CEO / Admins',
  type: 'admin',
  children: [
    {
      id: 't1',
      name: 'Engineering Team',
      type: 'team',
      children: [
        { id: 'm1', name: 'Alice (Lead)', type: 'member' },
        { id: 'm2', name: 'Bob', type: 'member' }
      ]
    },
    {
      id: 't2',
      name: 'Design Team',
      type: 'team',
      children: [
        { id: 'm3', name: 'Charlie (Lead)', type: 'member' }
      ]
    }
  ]
};

function OrgNode({ node, openInspector }) {
  const [expanded, setExpanded] = useState(true);

  const handleClick = (e) => {
    e.stopPropagation();
    openInspector(node.type, node);
  };

  return (
    <div style={{ marginLeft: '24px', position: 'relative' }}>
      <div 
        onClick={handleClick}
        style={{ 
          padding: '8px 16px', 
          margin: '8px 0',
          border: '1px solid #ccc', 
          borderRadius: '8px', 
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          cursor: 'pointer',
          background: node.type === 'admin' ? '#f3f4f6' : node.type === 'team' ? '#e0f2fe' : '#fff'
        }}
      >
        {node.children && (
          <span onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }} style={{ cursor: 'pointer', fontSize: '12px' }}>
            {expanded ? '▼' : '▶'}
          </span>
        )}
        <span>{node.name}</span>
      </div>
      
      {expanded && node.children && (
        <div style={{ borderLeft: '1px solid #ddd', paddingLeft: '8px', marginLeft: '12px' }}>
          {node.children.map(child => (
            <OrgNode key={child.id} node={child} openInspector={openInspector} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function OrganizationGraph() {
  const openInspector = (type, data) => {
    console.log('Inspector triggered from Org Graph:', type, data);
  };

  return (
    <div style={{ padding: '24px', background: '#fafafa', borderRadius: '8px', border: '1px solid #eaeaea' }}>
      <h2 style={{ fontSize: '18px', marginBottom: '16px' }}>Organization Hierarchical Graph</h2>
      <OrgNode node={orgData} openInspector={openInspector} />
    </div>
  );
}

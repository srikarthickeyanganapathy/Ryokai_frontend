import React, { useState } from 'react';
import PermissionHeatmap from './PermissionHeatmap';

export default function RoleBuilderStudio() {
  const [selectedRole, setSelectedRole] = useState('Member');
  const [draftRole, setDraftRole] = useState('Member');

  const getDelta = () => {
    if (selectedRole === draftRole) return <span style={{ color: '#888' }}>No changes</span>;
    return <span style={{ color: '#10b981' }}>+2 Permissions, -1 Permission</span>; // Mock delta
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <PermissionHeatmap />
      
      <div style={{ padding: '24px', background: '#fff', borderRadius: '8px', border: '1px solid #eaeaea' }}>
        <h2 style={{ fontSize: '18px', marginBottom: '16px' }}>Role Builder Studio</h2>
        <div style={{ display: 'flex', gap: '24px' }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Editing Role</label>
            <select 
              value={selectedRole} 
              onChange={e => setSelectedRole(e.target.value)}
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
            >
              <option value="Admin">Admin</option>
              <option value="Manager">Manager</option>
              <option value="Member">Member</option>
              <option value="Observer">Observer</option>
            </select>
          </div>
          <div style={{ flex: 1, padding: '16px', background: '#f9fafb', borderRadius: '8px' }}>
            <h3 style={{ fontSize: '14px', margin: '0 0 8px' }}>Live Role Impact Preview</h3>
            <div style={{ fontSize: '14px' }}>
              Comparing against Base: <strong>{draftRole}</strong>
            </div>
            <div style={{ marginTop: '8px', fontWeight: 'bold' }}>
              Delta: {getDelta()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

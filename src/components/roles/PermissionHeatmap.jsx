import React from 'react';

const categories = ['Users', 'Teams', 'Billing', 'Settings'];
const roles = ['Admin', 'Manager', 'Member', 'Observer'];

const permissions = {
  Admin: { Users: 4, Teams: 4, Billing: 4, Settings: 4 },
  Manager: { Users: 3, Teams: 4, Billing: 1, Settings: 2 },
  Member: { Users: 1, Teams: 2, Billing: 0, Settings: 1 },
  Observer: { Users: 1, Teams: 1, Billing: 0, Settings: 0 },
};

const getColor = (level) => {
  if (level === 4) return '#ef4444'; // Full access (Red)
  if (level === 3) return '#f59e0b'; // High (Orange)
  if (level === 2) return '#10b981'; // Medium (Green)
  if (level === 1) return '#3b82f6'; // Low (Blue)
  return '#f3f4f6'; // None (Gray)
};

export default function PermissionHeatmap() {
  return (
    <div style={{ padding: '24px', background: '#fff', borderRadius: '8px', border: '1px solid #eaeaea' }}>
      <h2 style={{ fontSize: '18px', marginBottom: '16px' }}>Permission Heatmap</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left', padding: '12px' }}>Role</th>
            {categories.map(cat => <th key={cat} style={{ padding: '12px', textAlign: 'center' }}>{cat}</th>)}
          </tr>
        </thead>
        <tbody>
          {roles.map(role => (
            <tr key={role} style={{ borderTop: '1px solid #eee' }}>
              <td style={{ padding: '12px', fontWeight: '500' }}>{role}</td>
              {categories.map(cat => {
                const level = permissions[role][cat];
                return (
                  <td key={cat} style={{ padding: '8px' }}>
                    <div style={{ background: getColor(level), height: '24px', borderRadius: '4px', textAlign: 'center', color: level > 1 ? '#fff' : '#000', fontSize: '12px', lineHeight: '24px' }}>
                      {level > 0 ? `Level ${level}` : 'None'}
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

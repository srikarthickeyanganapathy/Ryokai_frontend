import React from 'react';

export default function HealthWidget() {
  return (
    <div style={{ border: '1px solid #eaeaea', borderRadius: '8px', padding: '24px', background: 'linear-gradient(135deg, #0070f3 0%, #10b981 100%)', color: 'white', height: '100%' }}>
      <h3 style={{ margin: '0 0 16px 0', fontSize: '20px' }}>Organization Health</h3>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '16px' }}>
        <div style={{ fontSize: '48px', fontWeight: 'bold', lineHeight: 1 }}>94%</div>
        <div style={{ paddingBottom: '6px', opacity: 0.9 }}>Client-side calculated score</div>
      </div>
      <div style={{ display: 'flex', gap: '24px', marginTop: '24px', borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '16px' }}>
        <div>
          <div style={{ fontSize: '12px', opacity: 0.8 }}>Active Members</div>
          <div style={{ fontSize: '20px', fontWeight: '600' }}>42</div>
        </div>
        <div>
          <div style={{ fontSize: '12px', opacity: 0.8 }}>Balance Metrics</div>
          <div style={{ fontSize: '20px', fontWeight: '600' }}>Optimal</div>
        </div>
      </div>
    </div>
  );
}

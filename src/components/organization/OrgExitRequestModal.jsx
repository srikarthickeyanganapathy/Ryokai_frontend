import React, { useState } from 'react';

export default function OrgExitRequestModal({ isOpen, onClose, onSubmit }) {
  const [reason, setReason] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSubmit) onSubmit({ reason });
    onClose();
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
    }}>
      <div style={{ background: '#fff', padding: '24px', borderRadius: '8px', width: '400px', maxWidth: '90%' }}>
        <h2 style={{ margin: '0 0 16px 0', fontSize: '20px', color: '#ef4444' }}>Request Organization Exit</h2>
        <p style={{ fontSize: '14px', color: '#666', marginBottom: '16px' }}>
          Submitting this request will notify your organization administrators. You will lose access to team workspaces and internal data once approved.
        </p>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>Reason for Exit</label>
            <textarea 
              value={reason}
              onChange={e => setReason(e.target.value)}
              required
              rows={4}
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', resize: 'vertical' }}
              placeholder="Please provide a brief reason for your exit request..."
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <button type="button" onClick={onClose} style={{ padding: '8px 16px', background: '#f5f5f5', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Cancel</button>
            <button type="submit" style={{ padding: '8px 16px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Submit Request</button>
          </div>
        </form>
      </div>
    </div>
  );
}

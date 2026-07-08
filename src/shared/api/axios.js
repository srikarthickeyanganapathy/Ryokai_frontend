// ⚠️ DEPRECATED — this client uses a different localStorage key ('aura-auth-token')
// and lacks the refresh-token queue. Use @/lib/api instead.
// Retained as a no-op stub to prevent import-time crashes from stale references.
// Delete this file once all consumers have migrated to @/lib/api.
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/api',
});

export default api;

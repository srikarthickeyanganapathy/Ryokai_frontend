// ⚠️ DEPRECATED — this client has no refresh-token queue and
// doesn't save new refresh tokens after refresh. Use @/lib/api instead.
// Retained as a no-op stub. Delete once all consumers have migrated.
import axios from 'axios';

const client = axios.create({ baseURL: 'http://localhost:8080/api' });
export default client;

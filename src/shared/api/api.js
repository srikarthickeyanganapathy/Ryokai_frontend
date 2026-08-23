import axios from 'axios';
import { toast } from 'sonner';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080/api/v1",
  timeout: 15000,
  withCredentials: false
});

/**
 * Fired when a request can't reach the server at all (no response — asleep or
 * cold-starting Render instance, or local outage) or gets a gateway error
 * (502/503/504). ServerStatusProvider listens for it and takes over the UX.
 */
export const SERVER_UNREACHABLE_EVENT = 'ryokai:server-unreachable';

/**
 * Debounced error toast — prevents flooding when many queries fail simultaneously
 * (e.g. backend down triggers 10+ concurrent API calls).
 */
let lastToastMessage = '';
let lastToastTime = 0;
const TOAST_DEBOUNCE_MS = 3000;
const debouncedToast = (message) => {
  const now = Date.now();
  if (message !== lastToastMessage || now - lastToastTime > TOAST_DEBOUNCE_MS) {
    lastToastMessage = message;
    lastToastTime = now;
    toast.error(message, { id: 'api-error' });
  }
};

// We no longer use proactive refresh because cross-tab race conditions on the timer
// cause the backend to detect token reuse and revoke all sessions.
// Instead, we use Web Locks API in the reactive interceptor to cleanly handle concurrency.

/**
 * @deprecated Do not use proactive refresh. Use Web Locks API in the reactive interceptor instead.
 * Scheduled for removal in the next major release.
 */
export function scheduleProactiveRefresh(accessToken) {
  // Deprecated - kept as no-op so we don't break other files calling it until they are updated
}

/**
 * @deprecated Do not use proactive refresh. Use Web Locks API in the reactive interceptor instead.
 * Scheduled for removal in the next major release.
 */
export function cancelProactiveRefresh() {
  // Deprecated
}

// --- Request Interceptor ---
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jwt_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// --- Date Transform ---
const transformDates = (obj, seen = new WeakSet()) => {
  if (obj === null || obj === undefined || typeof obj !== 'object') return obj;
  if (seen.has(obj)) return obj; // guard against circular references
  seen.add(obj);

  for (const key of Object.keys(obj)) {
    const val = obj[key];
    if (typeof val === 'string') {
      // If it's a LocalDateTime string like '2024-01-01T12:00:00' (no Z or offset at the end)
      if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?$/.test(val)) {
        obj[key] = val + 'Z';
      }
    } else if (Array.isArray(val)) {
      // Recursively transform only arrays of objects. Numeric arrays are left
      // untouched (F-014): the backend serializes all dates as ISO strings, so a
      // numeric [year, month, day, ...] array is user data (coordinates, chart
      // series), never a date — converting it corrupts legitimate payloads.
      if (val.length > 0 && typeof val[0] === 'object') {
        transformDates(val, seen);
      }
    } else if (typeof val === 'object') {
      transformDates(val, seen);
    }
  }
  return obj;
};

// --- Response Interceptor ---
api.interceptors.response.use(
  (response) => {
    if (response.data) {
      transformDates(response.data);
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Server unreachable (no response: asleep/cold-starting instance, network
    // cut) or gateway error — let ServerStatusProvider show the reconnect
    // screen and poll until the instance answers.
    const status = error.response?.status;
    if (typeof window !== 'undefined' && (!error.response || status === 502 || status === 503 || status === 504)) {
      window.dispatchEvent(new Event(SERVER_UNREACHABLE_EVENT));
    }

    if (error.response) {
      if (error.response.status === 401 && !originalRequest._retry && originalRequest.url !== '/auth/login' && originalRequest.url !== '/session/refresh') {
        originalRequest._retry = true;
        
        const currentToken = localStorage.getItem('jwt_token');

        try {
          const doRefresh = async () => {
            // If another request/tab already refreshed the token while we waited for the lock, just use it
            const newToken = localStorage.getItem('jwt_token');
            if (newToken && newToken !== currentToken) {
              originalRequest.headers['Authorization'] = 'Bearer ' + newToken;
              return api(originalRequest);
            }

            const refreshToken = localStorage.getItem('jwt_refresh');
            if (!refreshToken) throw new Error("No refresh token");

            let data;
            try {
              const response = await axios.post(`${api.defaults.baseURL}/session/refresh`, { refreshToken });
              data = response.data;
            } catch (firstAttemptError) {
              const status = firstAttemptError?.response?.status;
              if (status === 429 || !firstAttemptError.response) {
                await new Promise(resolve => setTimeout(resolve, 2000));
                const retryResponse = await axios.post(`${api.defaults.baseURL}/session/refresh`, { refreshToken });
                data = retryResponse.data;
              } else {
                throw firstAttemptError;
              }
            }

            localStorage.setItem('jwt_token', data.accessToken);
            localStorage.setItem('jwt_refresh', data.refreshToken);
            originalRequest.headers['Authorization'] = 'Bearer ' + data.accessToken;
            return api(originalRequest);
          };

          // Use Web Locks API to prevent cross-tab and intra-tab race conditions!
          if (typeof navigator !== 'undefined' && navigator.locks) {
            return await navigator.locks.request('ryokai_refresh_lock', doRefresh);
          } else {
            return await doRefresh();
          }
        } catch (refreshError) {
          localStorage.removeItem('jwt_token');
          localStorage.removeItem('jwt_refresh');
          window.dispatchEvent(new Event('session-expired'));
          return Promise.reject(refreshError);
        }
      }

      if (error.response.status === 403) {
        if (error.response.data?.code === 'EMAIL_NOT_VERIFIED') {
          // Auth-flow specific: handled by the login form (redirect to verify-email).
        } else {
          toast.error("You don't have permission to do that");
          window.dispatchEvent(new Event('auth-forbidden'));
        }
      } else if (error.response.status === 409) {
        const code = error.response.data?.code;
        if (code === 'OPTIMISTIC_LOCK_CONFLICT') {
          toast.error("This resource was updated by someone else. Please refresh to get the latest changes.");
        } else {
          toast.error(error.response.data?.message || "Conflict error");
        }
      } else if (error.response.status === 400 && error.response.data) {
        const data = error.response.data;
        if (data.errors && typeof data.errors === 'object') {
          const details = Object.values(data.errors).join(', ');
          data.message = data.message ? `${data.message}: ${details}` : details;
        }
        toast.error(data.message || 'Validation error');
      } else if (error.response.status === 429) {
        debouncedToast("Rate limited — please slow down");
      } else if (error.response.status >= 500) {
        debouncedToast("Server error — try again");
      }
    }
    // No-response failures are surfaced by ServerStatusProvider's overlay;
    // a toast here would just repeat under it.

    return Promise.reject(error);
  }
);

export default api;

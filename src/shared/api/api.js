import axios from 'axios';
import { toast } from 'sonner';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080/api",
  timeout: 15000,
  withCredentials: false
});

// We no longer use proactive refresh because cross-tab race conditions on the timer
// cause the backend to detect token reuse and revoke all sessions.
// Instead, we use Web Locks API in the reactive interceptor to cleanly handle concurrency.

export function scheduleProactiveRefresh(accessToken) {
  // Deprecated - kept as no-op so we don't break other files calling it until they are updated
}

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

// --- Date Array Transform ---
const transformDateArrays = (obj) => {
  if (obj === null || obj === undefined || typeof obj !== 'object') return obj;

  for (const key of Object.keys(obj)) {
    const val = obj[key];
    if (Array.isArray(val)) {
      if (val.length >= 3 && val.length <= 7 && 
          typeof val[0] === 'number' && val[0] > 2000 && val[0] < 2100 &&
          typeof val[1] === 'number' && val[1] >= 1 && val[1] <= 12 &&
          typeof val[2] === 'number' && val[2] >= 1 && val[2] <= 31) {
        
        const [year, month, day, hour = 0, minute = 0, second = 0] = val;
        // Construct the date in UTC to prevent the browser from applying local timezone offsets
        const dateObj = new Date(Date.UTC(year, month - 1, day, hour, minute, second));
        obj[key] = dateObj.toISOString();
      } else {
        // Only recursively transform if it's an array of objects to prevent accidental primitive corruption
        if (val.length > 0 && typeof val[0] === 'object') {
          transformDateArrays(val);
        }
      }
    } else if (typeof val === 'object') {
      transformDateArrays(val);
    }
  }
  return obj;
};

// --- Response Interceptor ---
api.interceptors.response.use(
  (response) => {
    if (response.data) {
      transformDateArrays(response.data);
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

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
        toast.error("You don't have permission to do that");
      } else if (error.response.status === 400 && error.response.data) {
        // Extract detailed validation errors from Spring Boot responses
        const data = error.response.data;
        if (data.errors && typeof data.errors === 'object') {
          const details = Object.values(data.errors).join(', ');
          data.message = data.message ? `${data.message}: ${details}` : details;
        }
      } else if (error.response.status === 429) {
        toast.error("Rate limited — please slow down");
      } else if (error.response.status >= 500) {
        toast.error("Server error — try again");
      }
    } else if (error.message === 'Network Error') {
      toast.error("Network error — check your connection");
    }

    return Promise.reject(error);
  }
);

export default api;

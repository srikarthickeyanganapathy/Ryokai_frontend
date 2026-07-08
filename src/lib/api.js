import axios from 'axios';
import { toast } from 'sonner';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080/api",
  timeout: 15000,
  withCredentials: false
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

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
      if (error.response.status === 401 && !originalRequest._retry && originalRequest.url !== '/auth/login' && originalRequest.url !== '/auth/refresh') {
        if (isRefreshing) {
          return new Promise(function (resolve, reject) {
            failedQueue.push({ resolve, reject });
          }).then(token => {
            originalRequest.headers['Authorization'] = 'Bearer ' + token;
            return api(originalRequest);
          }).catch(err => {
            return Promise.reject(err);
          });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          const refreshToken = localStorage.getItem('jwt_refresh');
          if (!refreshToken) {
            throw new Error("No refresh token");
          }

          const { data } = await axios.post(`${api.defaults.baseURL}/auth/refresh`, { refreshToken });

          localStorage.setItem('jwt_token', data.accessToken);
          localStorage.setItem('jwt_refresh', data.refreshToken);


          originalRequest.headers['Authorization'] = 'Bearer ' + data.accessToken;

          processQueue(null, data.accessToken);

          return api(originalRequest);
        } catch (refreshError) {
          processQueue(refreshError, null);
          localStorage.removeItem('jwt_token');
          localStorage.removeItem('jwt_refresh');
          window.location.href = '/login';
          toast.error("Session expired, please log in again");
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }

      if (error.response.status === 403) {
        toast.error("You don't have permission to do that");
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

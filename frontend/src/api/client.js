import axios from 'axios';
import { getAccessToken, getRefreshToken, setSession, clearSession } from '../services/authStorage';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
});

let isRefreshing = false;
let refreshQueue = [];

function processQueue(error, token = null) {
  refreshQueue.forEach((p) => {
    if (error) p.reject(error);
    else p.resolve(token);
  });
  refreshQueue = [];
}

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;
    const isAuthRoute =
      original?.url?.includes('/auth/login') ||
      original?.url?.includes('/auth/firebase') ||
      original?.url?.includes('/auth/refresh');

    if (err.response?.status !== 401 || original._retry || isAuthRoute) {
      return Promise.reject(err);
    }

    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      clearSession();
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
      return Promise.reject(err);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        refreshQueue.push({ resolve, reject });
      }).then((token) => {
        original.headers.Authorization = `Bearer ${token}`;
        return api(original);
      });
    }

    original._retry = true;
    isRefreshing = true;

    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_API_URL || '/api'}/auth/refresh`,
        { refreshToken }
      );
      const { accessToken, refreshToken: newRefresh, user } = data.data;
      setSession({ accessToken, refreshToken: newRefresh, user });
      processQueue(null, accessToken);
      original.headers.Authorization = `Bearer ${accessToken}`;
      return api(original);
    } catch (refreshErr) {
      processQueue(refreshErr, null);
      clearSession();
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
      return Promise.reject(refreshErr);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;

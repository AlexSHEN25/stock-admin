import axios from 'axios';

export const TOKEN_KEY = 'stock_admin_token';

const http = axios.create({
  baseURL: '/',
  timeout: 15000,
});

http.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

http.interceptors.response.use(
  (response) => {
    const payload = response.data;
    if (payload && typeof payload === 'object' && Object.prototype.hasOwnProperty.call(payload, 'code')) {
      if (payload.code === 200) return payload.data;
      if (payload.code === 401) {
        localStorage.removeItem(TOKEN_KEY);
        window.dispatchEvent(new CustomEvent('auth-expired'));
      }
      throw new Error(payload.message || '通信エラー');
    }
    return payload;
  },
  (error) => {
    const status = error?.response?.status;
    if (status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      window.dispatchEvent(new CustomEvent('auth-expired'));
    }
    const message = error?.response?.data?.message || error?.message || '通信エラー';
    return Promise.reject(new Error(message));
  },
);

export default http;

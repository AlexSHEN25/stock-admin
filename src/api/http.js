import axios from 'axios';

export const TOKEN_KEY = 'stock_admin_token';
export const TOKEN_EXPIRES_AT_KEY = 'stock_admin_token_expires_at';
export const LOGIN_TTL_MS = 24 * 60 * 60 * 1000;

const http = axios.create({
  baseURL: '/',
  timeout: 15000,
});

export function saveAuthToken(token, ttlMs = LOGIN_TTL_MS) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(TOKEN_EXPIRES_AT_KEY, String(Date.now() + ttlMs));
}

export function clearAuthToken() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(TOKEN_EXPIRES_AT_KEY);
}

export function isAuthTokenExpired() {
  const expiresAt = Number(localStorage.getItem(TOKEN_EXPIRES_AT_KEY));
  return Boolean(expiresAt && Date.now() >= expiresAt);
}

export function getStoredToken() {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) return '';
  if (isAuthTokenExpired()) {
    clearAuthToken();
    return '';
  }
  return token;
}

http.interceptors.request.use((config) => {
  config.headers = config.headers || {};
  config.headers['Accept-Language'] = 'ja-JP';
  config.headers['X-Lang'] = 'ja-JP';

  const rawToken = localStorage.getItem(TOKEN_KEY);
  const token = getStoredToken();
  if (rawToken && !token) {
    window.dispatchEvent(new CustomEvent('auth-expired'));
    return Promise.reject(new Error('ログインの有効期限が切れました'));
  }
  if (token) {
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
        clearAuthToken();
        window.dispatchEvent(new CustomEvent('auth-expired'));
      }
      throw new Error(payload.message || '通信エラー');
    }
    return payload;
  },
  (error) => {
    const status = error?.response?.status;
    if (status === 401) {
      clearAuthToken();
      window.dispatchEvent(new CustomEvent('auth-expired'));
    }
    const message = error?.response?.data?.message || error?.message || '通信エラー';
    return Promise.reject(new Error(message));
  },
);

export default http;

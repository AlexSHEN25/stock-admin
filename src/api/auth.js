import axios from 'axios';
import http, { LANG_KEY, TOKEN_KEY } from './http';

export function login(payload) {
  return http.post('/api/user/login', payload);
}

export function logout() {
  return http.post('/api/user/logout');
}

export async function fetchPermissionScope() {
  const res = await http.get('/api/user/permissions');
  return normalizePermissionPayload(res);
}

export async function probeI18n() {
  const locale = localStorage.getItem(LANG_KEY) || 'ja-JP';
  const token = localStorage.getItem(TOKEN_KEY);
  const headers = {
    'Accept-Language': locale,
    'X-Lang': locale,
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await axios.get('/api/config/page', {
    baseURL: '/',
    timeout: 8000,
    headers,
    params: { pageNum: 1, pageSize: 1 },
    validateStatus: (status) => status >= 200 && status < 500,
  });

  const serverLocale = String(res.headers?.['content-language'] || '').toLowerCase();
  const expect = locale.toLowerCase();
  return {
    ok: res.status < 400,
    localeMatched: !serverLocale || serverLocale.includes(expect) || expect.includes(serverLocale),
    locale,
    serverLocale: res.headers?.['content-language'] || '',
  };
}

function normalizePermissionPayload(payload) {
  if (Array.isArray(payload)) {
    return { menuCodes: [], permissionCodes: payload.map((x) => String(x || '')).filter(Boolean) };
  }

  const menuCodes = Array.isArray(payload?.menuCodes)
    ? payload.menuCodes.map((x) => String(x || '')).filter(Boolean)
    : [];

  const permissionCodes = Array.isArray(payload?.permissionCodes)
    ? payload.permissionCodes.map((x) => String(x || '')).filter(Boolean)
    : Array.isArray(payload?.codes)
      ? payload.codes.map((x) => String(x || '')).filter(Boolean)
      : [];

  return { menuCodes, permissionCodes };
}

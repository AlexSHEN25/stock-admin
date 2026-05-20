import http from './http';

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


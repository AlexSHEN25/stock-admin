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

export async function changeMyPassword(currentUsername, newPassword) {
  const username = String(currentUsername || '').trim();
  const password = String(newPassword || '');
  if (!username) throw new Error('ユーザー名が取得できません');
  if (!password) throw new Error('新しいパスワードを入力してください');

  const page = await http.post('/api/user/page', {
    pageNum: 1,
    pageSize: 10,
    username,
  });
  const records = Array.isArray(page?.records) ? page.records : [];
  const self = records.find((item) => String(item?.username || '').trim() === username);
  const userId = self?.id;
  if (!userId) throw new Error('ユーザー情報の取得に失敗しました');

  return http.put(`/api/user/${userId}/password`, { password });
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


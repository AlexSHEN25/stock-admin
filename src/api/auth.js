import http from './http';

const AUTH_MESSAGES = {
  userMissing: 'ユーザー名が未入力です',
  passwordMissing: '新しいパスワードを入力してください',
  userLookupFail: 'ユーザー情報の取得に失敗しました',
};

export function login(payload) {
  return http.post('/api/user/login', payload);
}

export function logout() {
  return http.post('/api/user/logout');
}

export async function fetchPermissionScope() {
  const response = await http.get('/api/user/permissions');
  return normalizePermissionPayload(response);
}

export async function changeMyPassword(currentUsername, newPassword) {
  const username = String(currentUsername || '').trim();
  const password = String(newPassword || '');
  if (!username) throw new Error(AUTH_MESSAGES.userMissing);
  if (!password) throw new Error(AUTH_MESSAGES.passwordMissing);

  const page = await http.post('/api/user/page', {
    pageNum: 1,
    pageSize: 10,
    username,
  });
  const records = Array.isArray(page?.records) ? page.records : [];
  const self = records.find((item) => String(item?.username || '').trim() === username);
  const userId = self?.id;
  if (!userId) throw new Error(AUTH_MESSAGES.userLookupFail);

  return http.put(`/api/user/${userId}/password`, { password });
}

function normalizePermissionPayload(payload) {
  if (Array.isArray(payload)) {
    return splitScopeCodes(payload);
  }

  const explicitMenuCodes = Array.isArray(payload?.menuCodes) ? payload.menuCodes : [];
  const explicitPermissionCodes = Array.isArray(payload?.permissionCodes) ? payload.permissionCodes : [];
  const merged = [
    ...explicitMenuCodes,
    ...explicitPermissionCodes,
    ...(Array.isArray(payload?.codes) ? payload.codes : []),
  ];

  return splitScopeCodes(merged);
}

function splitScopeCodes(source) {
  const raw = Array.isArray(source)
    ? source.map((item) => String(item || '').trim()).filter(Boolean)
    : [];

  const menuCodes = [...new Set(raw.filter((code) => code.startsWith('MENU_')))];
  const permissionCodes = [...new Set(raw.filter((code) => !code.startsWith('MENU_')))];

  return { menuCodes, permissionCodes };
}

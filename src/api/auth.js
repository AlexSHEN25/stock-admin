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
  const response = await http.get('/api/user/permission-scope');
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
    return { ...splitScopeCodes(payload), menus: [] };
  }

  const explicitMenuCodes = Array.isArray(payload?.menuCodes) ? payload.menuCodes : [];
  const explicitPermissionCodes = Array.isArray(payload?.permissionCodes) ? payload.permissionCodes : [];
  const explicitRoleCodes = Array.isArray(payload?.roleCodes) ? payload.roleCodes : [];
  const merged = [
    ...explicitMenuCodes,
    ...explicitPermissionCodes,
    ...explicitRoleCodes,
    ...(Array.isArray(payload?.codes) ? payload.codes : []),
  ];
  const normalizedCodes = splitScopeCodes(merged);

  return {
    ...normalizedCodes,
    superAdmin: Boolean(payload?.superAdmin),
    allDataWrite: Boolean(payload?.allDataWrite),
    username: String(
      payload?.username
      ?? payload?.userName
      ?? payload?.nickname
      ?? payload?.nickName
      ?? payload?.loginName
      ?? payload?.account
      ?? payload?.user?.username
      ?? payload?.user?.userName
      ?? '',
    ).trim(),
    userId: Number(payload?.userId ?? payload?.user?.id ?? 0) || null,
    deptId: Number(payload?.deptId ?? payload?.user?.deptId ?? payload?.dept?.id ?? 0) || null,
    deptName: String(payload?.deptName ?? payload?.user?.deptName ?? payload?.dept?.name ?? '').trim(),
    groupCode: normalizeGroupCode(
      payload?.groupCode
      ?? payload?.stockGroup
      ?? payload?.user?.groupCode
      ?? payload?.dept?.groupCode
      ?? payload?.deptName
      ?? payload?.dept?.name,
    ),
    menus: normalizeMenuScopes(payload?.menus),
  };
}

function normalizeGroupCode(value) {
  const text = String(value || '').trim().toUpperCase();
  const match = text.match(/(?:^|[^A-Z])([ABC])(?:組|组|GROUP|$)/i);
  return match ? match[1].toUpperCase() : '';
}

function splitScopeCodes(source) {
  const raw = Array.isArray(source)
    ? source.map((item) => String(item || '').trim()).filter(Boolean)
    : [];

  const menuCodes = [...new Set(raw.filter((code) => code.startsWith('MENU_')))];
  const permissionCodes = [...new Set(raw.filter((code) => !code.startsWith('MENU_')))];

  const roleCodes = [...new Set(raw.filter((code) => code.startsWith('ROLE_')))];
  return { menuCodes, permissionCodes, roleCodes };
}

function normalizeMenuScopes(source) {
  if (!Array.isArray(source)) return [];
  return source
    .map((item) => ({
      key: String(item?.key || '').trim(),
      label: String(item?.label || '').trim(),
      module: String(item?.module || '').trim(),
      path: String(item?.path || '').trim(),
      sort: Number.isFinite(Number(item?.sort)) ? Number(item.sort) : 0,
      visible: item?.visible !== false,
      actions: normalizeActions(item?.actions),
    }))
    .filter((item) => item.key);
}

function normalizeActions(source) {
  if (Array.isArray(source)) {
    const actionSet = new Set(source.map((item) => String(item || '').trim().toLowerCase()).filter(Boolean));
    return actionObjectFromSet(actionSet);
  }
  if (typeof source === 'string') {
    const actionSet = new Set(source.split(/[\s,;|/]+/).map((item) => item.trim().toLowerCase()).filter(Boolean));
    return actionObjectFromSet(actionSet);
  }
  const actions = source && typeof source === 'object' ? source : {};
  return {
    read: Boolean(actions.read),
    create: Boolean(actions.create),
    edit: Boolean(actions.edit),
    delete: Boolean(actions.delete),
    batchDelete: Boolean(actions.batchDelete),
    inlineEdit: Boolean(actions.inlineEdit),
  };
}

function actionObjectFromSet(actionSet) {
  const has = (...names) => names.some((name) => actionSet.has(name));
  return {
    read: has('read', 'view', 'list', 'page'),
    create: has('create', 'add', 'insert'),
    edit: has('edit', 'update', 'modify'),
    delete: has('delete', 'remove'),
    batchDelete: has('batchdelete', 'batch_delete', 'batch-delete'),
    inlineEdit: has('inlineedit', 'inline_edit', 'inline-edit'),
  };
}

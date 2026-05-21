import http from './http';

export async function fetchPage(modulePath, params) {
  const safeParams = normalizePageParams(params);
  const isUser = modulePath === 'user';
  const url = `/api/${modulePath}/page`;
  const res = isUser ? await http.post(url, safeParams) : await http.get(url, { params: safeParams });
  return normalizePage(res);
}

export async function createItem(modulePath, payload) {
  return http.post(`/api/${modulePath}`, payload);
}

export async function updateItem(modulePath, payload) {
  if (modulePath === 'user') {
    return http.put(`/api/${modulePath}/${payload.id}`, payload);
  }
  return http.put(`/api/${modulePath}`, payload);
}

export async function removeItem(modulePath, id) {
  return http.delete(`/api/${modulePath}/${id}`);
}

export async function fetchModuleOptions(modulePath) {
  const params = { pageNum: 1, pageSize: 50, sortBy: 'updateTime', sortOrder: 'desc' };
  const page = await fetchPage(modulePath, params);
  return page.records || [];
}

export async function readMessage(id) {
  return http.put(`/api/message/read/${id}`);
}

export async function readAllMessages() {
  return http.put('/api/message/read-all');
}

function normalizePage(data) {
  const records = data?.records || data?.list || data?.rows || [];
  const total = Number(data?.total ?? records.length ?? 0);
  return { records: Array.isArray(records) ? records : [], total };
}

function normalizePageParams(params) {
  const out = { ...(params || {}) };
  if (Object.prototype.hasOwnProperty.call(out, 'pageSize')) {
    out.pageSize = normalizePageSize(out.pageSize);
  }
  return out;
}

function normalizePageSize(input) {
  const allowed = [10, 20, 50];
  const n = Number(input);
  if (allowed.includes(n)) return n;
  return 10;
}


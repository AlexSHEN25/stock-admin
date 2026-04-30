import http from './http';

export async function fetchPage(modulePath, params) {
  const isUser = modulePath === 'user';
  const url = `/api/${modulePath}/page`;
  const res = isUser ? await http.post(url, params || {}) : await http.get(url, { params });
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

export async function fetchSchemaMenu() {
  return http.get('/api/schema/menu');
}

function normalizePage(data) {
  const records = data?.records || data?.list || data?.rows || [];
  const total = Number(data?.total ?? records.length ?? 0);
  return { records: Array.isArray(records) ? records : [], total };
}

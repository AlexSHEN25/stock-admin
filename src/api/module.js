import http from './http';

const PAGE_SIZE_OPTIONS = [10, 20, 50];
const MESSAGE_READ_FAIL = '既読更新に失敗しました';

export async function fetchPage(modulePath, params) {
  const safeParams = normalizePageParams(params);
  const isUserModule = modulePath === 'user';
  const url = `/api/${modulePath}/page`;
  const response = isUserModule
    ? await http.post(url, safeParams)
    : await http.get(url, { params: safeParams });
  return normalizePage(response);
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
  const page = await fetchPage(modulePath, {
    pageNum: 1,
    pageSize: 50,
    sortBy: 'updateTime',
    sortOrder: 'desc',
  });
  return page.records || [];
}

export async function readMessage(id) {
  const updated = await http.put(`/api/message/read/${id}`);
  if (updated === false) {
    throw new Error(MESSAGE_READ_FAIL);
  }
  return updated;
}

export async function readAllMessages() {
  const updatedCount = await http.put('/api/message/read-all');
  if (updatedCount === false) {
    throw new Error(MESSAGE_READ_FAIL);
  }
  return Number(updatedCount ?? 0);
}

function normalizePage(data) {
  const records = data?.records || data?.list || data?.rows || [];
  const total = Number(data?.total ?? records.length ?? 0);
  return {
    records: Array.isArray(records) ? records : [],
    total,
  };
}

function normalizePageParams(params) {
  const output = { ...(params || {}) };
  if (Object.prototype.hasOwnProperty.call(output, 'pageSize')) {
    output.pageSize = normalizePageSize(output.pageSize);
  }
  return output;
}

function normalizePageSize(input) {
  const pageSize = Number(input);
  if (PAGE_SIZE_OPTIONS.includes(pageSize)) return pageSize;
  return PAGE_SIZE_OPTIONS[0];
}


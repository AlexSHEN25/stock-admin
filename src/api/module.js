import http from './http';

const PAGE_SIZE_OPTIONS = [10, 20, 50];
const MESSAGE_READ_FAIL = '既読更新に失敗しました';

export async function fetchPage(modulePath, params) {
  const safeParams = normalizePageParams(params);
  const isUserModule = modulePath === 'user';
  let response;
  if (isUserModule) {
    response = await requestUserPageWithFallback(safeParams);
  } else {
    const url = `/api/${modulePath}/page`;
    response = await http.get(url, { params: safeParams });
  }
  return normalizePage(response);
}

export async function createItem(modulePath, payload) {
  if (modulePath === 'user') {
    return requestWithFallback(
      () => http.post('/api/user', payload),
      () => http.post('/api/user/create', payload),
    );
  }
  return http.post(`/api/${modulePath}`, payload);
}

export async function updateItem(modulePath, payload) {
  if (modulePath === 'user') {
    return requestWithFallback(
      () => http.put(`/api/user/${payload.id}`, payload),
      () => http.put('/api/user', payload),
      () => http.post('/api/user/update', payload),
    );
  }
  return http.put(`/api/${modulePath}`, payload);
}

export async function removeItem(modulePath, id) {
  if (modulePath === 'user') {
    return requestWithFallback(
      () => http.delete(`/api/user/${id}`),
      () => http.delete('/api/user', { params: { id } }),
      () => http.post('/api/user/delete', { id }),
    );
  }
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

export async function fetchEnumOptions(enumKey) {
  if (!enumKey) return [];
  const data = await http.get('/api/meta/enum-options', { params: { enumKey } });
  if (!Array.isArray(data)) return [];
  return data.map((item) => ({
    label: String(item?.name ?? ''),
    value: Number(item?.code),
  })).filter((item) => item.label !== '' && !Number.isNaN(item.value));
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

export async function uploadUserAvatar(userId, file) {
  const formData = new FormData();
  formData.append('file', file);
  const config = {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  };
  return requestWithFallback(
    () => http.post(`/api/user/${userId}/avatar`, formData, config),
    () => http.post('/api/user/avatar', formData, config),
    () => http.post('/api/user/upload-avatar', formData, config),
  );
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

async function requestUserPageWithFallback(params) {
  return requestWithFallback(
    () => http.post('/api/user/page', params),
    () => http.get('/api/user/page', { params }),
    () => http.post('/api/user/list', params),
    () => http.get('/api/user/list', { params }),
  );
}

async function requestWithFallback(...candidates) {
  let lastError;
  for (const fn of candidates) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (!shouldFallback(error)) {
        throw error;
      }
    }
  }
  throw lastError;
}

function shouldFallback(error) {
  const status = Number(error?.status ?? error?.response?.status ?? 0);
  if (!status) return false;
  return status === 404 || status === 405 || status === 501;
}

function normalizePageSize(input) {
  const pageSize = Number(input);
  if (PAGE_SIZE_OPTIONS.includes(pageSize)) return pageSize;
  return PAGE_SIZE_OPTIONS[0];
}



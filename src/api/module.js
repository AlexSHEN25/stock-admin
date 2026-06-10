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
    const url = `/api/${resolveModulePath(modulePath)}/page`;
    response = await requestPageWithSortFallback(url, safeParams);
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
  return http.post(`/api/${resolveModulePath(modulePath)}`, payload);
}

export async function fetchItem(modulePath, id) {
  if (id === undefined || id === null || String(id).trim() === '') return null;
  return http.get(`/api/${resolveModulePath(modulePath)}/${id}`);
}

export async function updateItem(modulePath, payload) {
  if (modulePath === 'user') {
    return requestWithFallback(
      () => http.put(`/api/user/${payload.id}`, payload),
      () => http.put('/api/user', payload),
      () => http.post('/api/user/update', payload),
    );
  }
  return http.put(`/api/${resolveModulePath(modulePath)}`, payload);
}

export async function removeItem(modulePath, id) {
  if (modulePath === 'user') {
    return requestWithFallback(
      () => http.delete(`/api/user/${id}`),
      () => http.delete('/api/user', { params: { id } }),
      () => http.post('/api/user/delete', { id }),
    );
  }
  return http.delete(`/api/${resolveModulePath(modulePath)}/${id}`);
}

export async function removeItems(modulePath, ids) {
  const list = Array.isArray(ids) ? ids.filter((x) => x !== undefined && x !== null) : [];
  if (list.length === 0) return null;
  if (modulePath === 'goods') {
    return requestWithFallback(
      () => http.delete('/api/goods/batch', { data: list }),
      () => http.post('/api/goods/batch', list),
    );
  }
  for (const id of list) {
    // keep compatibility for other modules without batch endpoint
    // eslint-disable-next-line no-await-in-loop
    await removeItem(modulePath, id);
  }
  return true;
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

export async function fetchMyGroupStockAvailable(params) {
  return Number(await http.get('/api/stock/group/available', { params })) || 0;
}

export async function fetchOutboundStockOrderOptions() {
  const page = await fetchPage('stockOrder', {
    pageNum: 1,
    pageSize: 50,
    orderType: 2,
    state: 2,
    sortBy: 'updateTime',
    sortOrder: 'desc',
  });
  return page.records || [];
}

export async function approveStockOrder(orderId, approved) {
  if (orderId === undefined || orderId === null || String(orderId).trim() === '') return null;
  return http.post(`/api/stock/approve/${orderId}`, null, {
    params: { approved: Boolean(approved) },
  });
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

export async function uploadFileByBizType(bizType, file, oldPath = '') {
  const formData = new FormData();
  formData.append('file', file);
  const config = {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    params: {
      bizType,
    },
  };

  const safeOldPath = normalizeUploadOldPath(oldPath);
  if (safeOldPath) {
    config.params.oldPath = safeOldPath;
  }

  const result = safeOldPath
    ? await http.put('/api/file/upload', formData, config)
    : await http.post('/api/file/upload', formData, config);

  if (typeof result === 'string') return result;
  if (result && typeof result === 'object') {
    return String(result.url || result.path || result.imageUrl || result.filePath || '');
  }
  return '';
}

function normalizeUploadOldPath(path) {
  const raw = String(path || '').trim();
  if (!raw) return '';
  if (raw.startsWith('data:') || raw.startsWith('blob:')) return '';
  if (/^https?:\/\//i.test(raw)) {
    try {
      const url = new URL(raw);
      return url.pathname || '';
    } catch (_e) {
      return '';
    }
  }
  return raw;
}
export async function fetchGoodsDetail(id) {
  if (id === undefined || id === null || String(id).trim() === '') return null;
  return requestWithFallback(
    () => http.get(`/api/goods/${id}/detail`),
    () => http.get(`/api/goods/${id}`),
  );
}

export async function fetchGoodsFormOptions() {
  const data = await http.get('/api/goods/form/options');
  return data && typeof data === 'object' ? data : {};
}

export async function getCandidateItems(id) {
  if (id === undefined || id === null || String(id).trim() === '') return [];
  const data = await http.get(`/api/requestForm/${id}/candidateItems`);
  return Array.isArray(data) ? data : [];
}

export async function addRequestItems(payload) {
  return http.post('/api/requestForm/items/add', payload || {});
}

export async function matchRequestItems(payload) {
  return http.post('/api/requestForm/items/match', payload || {});
}

export async function removeRequestItems(payload) {
  return http.post('/api/requestForm/items/remove', payload || {});
}

export async function createRequestForm(payload) {
  return http.post('/api/requestForm', payload || {});
}

export async function createRequestFormWithItems(payload) {
  return http.post('/api/requestForm/withItems', payload || {});
}

export async function createRequestFormFromOutbound(payload) {
  return http.post('/api/requestForm/fromOutbound', payload || {});
}

export async function reapplyRequestInbound(id) {
  if (id === undefined || id === null || String(id).trim() === '') return null;
  return http.post(`/api/requestForm/reapplyInbound/${id}`);
}

export async function reapplyRequestItemInbound(payload) {
  return http.post('/api/requestForm/items/reapplyInbound', payload || {});
}

export async function addRequestItemsFromStockOrder(payload) {
  return requestWithFallback(
    () => http.post('/api/requestForm/items/add', payload || {}),
    () => http.post('/api/requestForm/items/addFromStockOrder', payload || {}),
    () => http.post('/api/requestForm/fromOutbound', payload || {}),
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

async function requestPageWithSortFallback(url, params) {
  try {
    return await http.get(url, { params });
  } catch (error) {
    if (!shouldRetryWithoutSort(error, params)) {
      throw error;
    }
    const fallbackParams = { ...(params || {}) };
    delete fallbackParams.sortBy;
    delete fallbackParams.sortOrder;
    return http.get(url, { params: fallbackParams });
  }
}

function shouldRetryWithoutSort(error, params) {
  const status = Number(error?.status ?? error?.response?.status ?? 0);
  if (status !== 500) return false;
  const sortBy = String(params?.sortBy || '').trim();
  return sortBy !== '';
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

function resolveModulePath(modulePath) {
  return modulePath;
}

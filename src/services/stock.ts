import { request } from '@umijs/max';

// 获取库存列表
export async function getStockList() {
  return request('/api/stock/list', {
    method: 'GET',
  });
}

// 入库
export async function stockIn(data: any) {
  return request('/api/stock/in', {
    method: 'POST',
    data,
  });
}

// 出库
export async function stockOut(data: any) {
  return request('/api/stock/out', {
    method: 'POST',
    data,
  });
}

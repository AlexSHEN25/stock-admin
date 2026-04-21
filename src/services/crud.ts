import type { ApiResult } from './http';
import { httpRequest } from './http';

interface PageResult<T> {
  total: number;
  pageNum: number;
  pageSize: number;
  records: T[];
}

export async function pageList(resource: string, params: Record<string, any>) {
  return httpRequest<PageResult<Record<string, any>>>(`/api/lowcode/${resource}`, {
    method: 'GET',
    params,
  });
}

export async function createOne(resource: string, data: Record<string, any>) {
  return httpRequest<Record<string, any>>(`/api/lowcode/${resource}`, {
    method: 'POST',
    data,
  });
}

export async function updateOne(resource: string, data: Record<string, any>) {
  const id = data?.id;
  if (id === undefined || id === null || id === '') {
    throw new Error('更新数据缺少主键 id');
  }
  return httpRequest<Record<string, any>>(`/api/lowcode/${resource}/${id}`, {
    method: 'PUT',
    data,
  });
}

export async function deleteOne(resource: string, id: number | string) {
  return httpRequest<boolean>(`/api/lowcode/${resource}/${id}`, {
    method: 'DELETE',
  });
}

export type { ApiResult };

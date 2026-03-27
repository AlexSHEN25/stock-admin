import type { ApiResult } from './http';
import { httpRequest } from './http';

interface PageResult<T> {
  total: number;
  pageNum: number;
  pageSize: number;
  records: T[];
}

export async function pageList(resource: string, params: Record<string, any>) {
  return httpRequest<PageResult<Record<string, any>>>(`/api/${resource}/page`, {
    method: 'GET',
    params,
  });
}

export async function createOne(resource: string, data: Record<string, any>) {
  return httpRequest<boolean>(`/api/${resource}`, {
    method: 'POST',
    data,
  });
}

export async function updateOne(resource: string, data: Record<string, any>) {
  return httpRequest<boolean>(`/api/${resource}`, {
    method: 'PUT',
    data,
  });
}

export async function deleteOne(resource: string, id: number | string) {
  return httpRequest<boolean>(`/api/${resource}/${id}`, {
    method: 'DELETE',
  });
}

export type { ApiResult };

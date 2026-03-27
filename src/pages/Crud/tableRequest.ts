import { pageList } from '@/services/crud';
import type { CrudRecord } from './types';

export const queryCrudTable = async (
  resource: string,
  params: Record<string, any>,
) => {
  const { current = 1, pageSize = 10, ...rest } = params;
  const res = await pageList(resource, {
    pageNum: current,
    pageSize,
    ...rest,
  });

  return {
    data: (res?.data?.records || []) as CrudRecord[],
    total: res?.data?.total || 0,
    success: res?.code === 200,
  };
};

import { pageList } from '@/services/crud';
import { getErrorMessage } from '@/services/http';
import type { CrudRecord } from './types';

const SORTABLE_TIME_FIELDS = new Set(['createTime', 'updateTime']);
const SORT_ORDER_MAP: Record<string, 'asc' | 'desc'> = {
  ascend: 'asc',
  descend: 'desc',
};

const isDayjsLike = (
  value: unknown,
): value is { format: (tpl: string) => string } =>
  Boolean(
    value &&
      typeof value === 'object' &&
      typeof (value as { format?: unknown }).format === 'function',
  );

const normalizeSearchValue = (value: unknown) => {
  if (Array.isArray(value)) {
    return value
      .map((item) =>
        isDayjsLike(item) ? item.format('YYYY-MM-DD HH:mm:ss') : item,
      )
      .join(',');
  }

  if (isDayjsLike(value)) {
    return value.format('YYYY-MM-DD HH:mm:ss');
  }

  return value;
};

const resolveTimeSorter = (sorter?: Record<string, any>) => {
  if (!sorter || typeof sorter !== 'object') {
    return undefined;
  }

  const entries = Object.entries(sorter);
  for (const [field, order] of entries) {
    if (!SORTABLE_TIME_FIELDS.has(field)) {
      continue;
    }
    const mappedOrder = SORT_ORDER_MAP[String(order)];
    if (!mappedOrder) {
      continue;
    }
    return { sortBy: field, sortOrder: mappedOrder };
  }

  return undefined;
};

export const queryCrudTable = async (
  resource: string,
  params: Record<string, any>,
  sorter?: Record<string, any>,
) => {
  try {
    const { current = 1, pageSize = 10, ...rest } = params;
    const cleanParams = Object.fromEntries(
      Object.entries(rest)
        .filter(
          ([key, value]) =>
            !key.endsWith('_timestamp') &&
            value !== undefined &&
            value !== null &&
            value !== '',
        )
        .map(([key, value]) => [key, normalizeSearchValue(value)]),
    );
    const timeSorter = resolveTimeSorter(sorter);

    const res = await pageList(resource, {
      page: current,
      size: pageSize,
      sortBy: timeSorter?.sortBy || 'updateTime',
      sortOrder: timeSorter?.sortOrder || 'desc',
      ...cleanParams,
    });

    return {
      data: (res?.data?.records || []) as CrudRecord[],
      total: res?.data?.total || 0,
      success: res?.code === 200,
    };
  } catch (error) {
    // Avoid uncaught promise rejection in ProTable request pipeline.
    return {
      data: [] as CrudRecord[],
      total: 0,
      success: false,
      message: getErrorMessage(error),
    };
  }
};

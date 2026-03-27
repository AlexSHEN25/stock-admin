export interface ApiResult<T> {
  code: number;
  message: string;
  data: T;
}

export const getErrorMessage = (error: unknown, fallback = '请求失败') => {
  if (typeof error === 'string' && error) {
    return error;
  }

  if (
    error &&
    typeof error === 'object' &&
    'message' in error &&
    typeof (error as { message?: unknown }).message === 'string'
  ) {
    return (error as { message: string }).message;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }
  return fallback;
};

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  params?: Record<string, any>;
  data?: Record<string, any>;
}

const buildUrl = (url: string, params?: Record<string, any>) => {
  if (!params) {
    return url;
  }

  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      search.append(key, String(value));
    }
  });

  const query = search.toString();
  return query ? `${url}?${query}` : url;
};

export const httpRequest = async <T>(url: string, options: RequestOptions = {}) => {
  const { method = 'GET', params, data } = options;
  const token = localStorage.getItem('token');

  const response = await fetch(buildUrl(url, params), {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: method === 'GET' || method === 'DELETE' ? undefined : JSON.stringify(data || {}),
  });

  const result = (await response.json()) as ApiResult<T>;

  if (result?.code !== 200) {
    throw new Error(result?.message || `请求失败(code=${result?.code ?? response.status})`);
  }

  return result;
};

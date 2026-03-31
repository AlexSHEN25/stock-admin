import { message } from 'antd';

export interface ApiResult<T> {
  code: number;
  message: string;
  data: T;
}

const LOGIN_ROUTE = '/user/login';
const LOGIN_EXPIRED_KEYWORDS = [
  '登录已过期',
  '登录超时',
  '未登录',
  'token失效',
  'token expired',
  'login timeout',
  'login timed out',
];

const isLoginExpiredMessage = (msg?: string) =>
  !!msg &&
  LOGIN_EXPIRED_KEYWORDS.some((keyword) =>
    msg.toLowerCase().includes(keyword.toLowerCase()),
  );
let isRedirectingToLogin = false;

const resolveBasePrefix = () => {
  const loginIndex = window.location.pathname.indexOf(LOGIN_ROUTE);
  if (loginIndex >= 0) {
    return window.location.pathname.slice(0, loginIndex);
  }
  return window.location.pathname.startsWith('/stock/') ? '/stock' : '';
};

const redirectToLogin = () => {
  if (isRedirectingToLogin) {
    return;
  }
  isRedirectingToLogin = true;
  const basePrefix = resolveBasePrefix();
  window.location.replace(`${basePrefix}${LOGIN_ROUTE}`);
};

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
  try {
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

    let result: ApiResult<T> | undefined;
    try {
      result = (await response.json()) as ApiResult<T>;
    } catch (_e) {
      result = undefined;
    }

    const errorMessage =
      result?.message || `请求失败(code=${result?.code ?? response.status})`;
    const isAuthExpired =
      response.status === 401 ||
      response.status === 403 ||
      isLoginExpiredMessage(result?.message) ||
      isLoginExpiredMessage(errorMessage);

    if (!response.ok || result?.code !== 200) {
      if (isAuthExpired) {
        message.warning(result?.message || '登录超时，请重新登录');
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        if (!window.location.pathname.endsWith(LOGIN_ROUTE)) {
          redirectToLogin();
        }
      }
      throw new Error(errorMessage);
    }

    return result;
  } catch (error) {
    const errorMessage = getErrorMessage(error);
    if (isLoginExpiredMessage(errorMessage)) {
      localStorage.removeItem('token');
      localStorage.removeItem('username');
      if (!window.location.pathname.endsWith(LOGIN_ROUTE)) {
        message.warning('登录超时，请重新登录');
        redirectToLogin();
      }
    }
    throw error;
  }
};

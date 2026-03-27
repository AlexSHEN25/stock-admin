import { message } from 'antd';
import type { ApiResult } from '@/services/http';
import { logout } from '@/services/user';

const loginPath = '/user/login';

export async function getInitialState() {
  const token = localStorage.getItem('token');
  const username = localStorage.getItem('username') || '用户';

  if (!token && window.location.pathname !== loginPath) {
    window.location.href = loginPath;
  }

  return {
    username,
    currentUser: token ? { name: username } : undefined,
  };
}

export const layout = ({ initialState }: { initialState?: any }) => {
  return {
    title: '库存管理系统',
    avatarProps: {
      title:
        initialState?.currentUser?.name || initialState?.username || '用户',
    },
    onPageChange: () => {
      const token = localStorage.getItem('token');
      if (!token && window.location.pathname !== loginPath) {
        window.location.href = loginPath;
      }
    },
    logout: async () => {
      try {
        await logout();
      } catch (_e) {
        // ignore
      }
      localStorage.removeItem('token');
      localStorage.removeItem('username');
      window.location.href = loginPath;
    },
  };
};

export const request = {
  responseInterceptors: [
    (response: any) => {
      const res = response?.data as ApiResult<any> | undefined;
      if (res && typeof res.code === 'number' && res.code !== 200) {
        message.error(res.message || '请求失败');
        throw new Error(res.message || 'Request failed');
      }
      return response;
    },
  ],
};

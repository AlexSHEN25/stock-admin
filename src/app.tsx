import type { RequestConfig } from '@umijs/max';
import { message } from 'antd';
import { logout } from '@/services/user';

// 请求配置
export const request: RequestConfig = {
  // 请求拦截
  requestInterceptors: [
    (config: any) => {
      const token = localStorage.getItem('token');

      if (token) {
        config.headers = {
          ...config.headers,
          Authorization: `Bearer ${token}`,
        };
      }

      return config;
    },
  ],

  // 响应拦截
  responseInterceptors: [
    (response: any) => {
      const res = response.data;

      if (res.code !== 200) {
        message.error(res.message || '请求失败');
        throw new Error(res.message);
      }

      return response;
    },
  ],
};

// 登录拦截
export async function getInitialState() {
  const token = localStorage.getItem('token');

  if (!token && location.pathname !== '/user/login') {
    window.location.href = '/user/login';
  }

  return {
    username: localStorage.getItem('username'),
  };
}

// Layout
export const layout = () => {
  return {
    title: '库存管理系统',

    avatarProps: {
      title: localStorage.getItem('username') || '用户',
    },

    // 退出登录（真正调用后端）
    logout: async () => {
      try {
        const res = await logout();

        if (res.data.success) {
          message.success('退出成功');
        }
      } catch (e) {
        message.error('退出失败');
      }

      localStorage.removeItem('token');
      localStorage.removeItem('username');

      window.location.href = '/user/login';
    },
  };
};

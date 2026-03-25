import { request } from '@umijs/max';

// 通用返回
interface Result<T> {
  code: number;
  message: string;
  data: T;
}

// 登录返回
interface LoginVO {
  token: string;
  userId: number;
  username: string;
}

// 退出返回（对应你的 LogoutVO）
interface LogoutVO {
  success: boolean;
  userId: number;
}

// 登录
export async function login(data: {
  username: string;
  password: string;
}) {
  return request<Result<LoginVO>>('/api/user/login', {
    method: 'POST',
    data,
  });
}

// 退出
export async function logout() {
  return request<Result<LogoutVO>>('/api/user/logout', {
    method: 'POST',
  });
}

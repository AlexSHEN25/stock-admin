import { httpRequest } from './http';

interface LoginVO {
  token: string;
  userId: number;
  username: string;
}

interface LogoutVO {
  success: boolean;
  userId: number;
}

export async function login(data: { username: string; password: string }) {
  return httpRequest<LoginVO>('/api/user/login', {
    method: 'POST',
    data,
  });
}

export async function logout() {
  return httpRequest<LogoutVO>('/api/user/logout', {
    method: 'POST',
  });
}

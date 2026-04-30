import http from './http';

export function login(payload) {
  return http.post('/api/user/login', payload);
}

export function logout() {
  return http.post('/api/user/logout');
}

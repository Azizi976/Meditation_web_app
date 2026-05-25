import api, { setAccessToken, clearAccessToken } from './api';

export async function register(data) {
  const res = await api.post('/auth/register', data);
  setAccessToken(res.data.accessToken);
  return res.data;
}

export async function login(email, password) {
  const res = await api.post('/auth/login', { email, password });
  setAccessToken(res.data.accessToken);
  return res.data;
}

export async function logout() {
  await api.post('/auth/logout').catch(() => {});
  clearAccessToken();
}

export async function getMe() {
  const res = await api.get('/auth/me');
  return res.data.user;
}

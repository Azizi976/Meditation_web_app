import api from './api';

export async function getMeditations(params = {}) {
  const res = await api.get('/meditations', { params });
  return res.data;
}

export async function getMeditation(id, lang) {
  const res = await api.get(`/meditations/${id}`, { params: { lang } });
  return res.data.meditation;
}

export async function getCategories(lang) {
  const res = await api.get('/meditations/categories', { params: { lang } });
  return res.data.categories;
}

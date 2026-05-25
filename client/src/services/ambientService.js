import api from './api';

export async function getAmbientSounds(lang) {
  const res = await api.get('/ambient', { params: { lang } });
  return res.data.ambientSounds;
}

export async function getPreferences() {
  const res = await api.get('/user/preferences');
  return res.data.preferences;
}

export async function updatePreferences(data) {
  const res = await api.put('/user/preferences', data);
  return res.data.preferences;
}

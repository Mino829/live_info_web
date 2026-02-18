import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ★RenderのサーバーURL
const BASE_URL = 'https://liveinfo-7gxe.onrender.com'; 

const api = axios.create({
  baseURL: BASE_URL,
});

const USER_ID_KEY = 'livepulse_fixed_user_id_v2';

// リクエストの前にIDをセット（なければ作って保存）
api.interceptors.request.use(async (config) => {
  try {
    let token = await AsyncStorage.getItem(USER_ID_KEY);
    if (!token) {
      token = 'user-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 9);
      await AsyncStorage.setItem(USER_ID_KEY, token);
    }
    config.headers['x-user-token'] = token;
  } catch (e) {
    config.headers['x-user-token'] = 'temp-' + Date.now();
  }
  return config;
});

// --- API関数群 ---

export const getArtists = async () => {
  const response = await api.get('/artists');
  return response.data;
};

export const addArtist = async (name: string, url: string) => {
  const response = await api.post('/artists', { name, url });
  return response.data;
};

export const deleteArtist = async (id: string) => {
  const response = await api.delete(`/artists/${id}`);
  return response.data;
};

export const toggleMuteArtist = async (id: string, muted: boolean) => {
  const response = await api.patch(`/artists/${id}/mute`, { muted });
  return response.data;
};

// ★ここが重要！検索キーワード(keyword)を受け取れるように変更
export const fetchLiveList = async (range: 'recent' | 'all' = 'recent', keyword?: string) => {
  let url = `/live?range=${range}`;
  if (keyword) {
    url += `&q=${encodeURIComponent(keyword)}`;
  }
  const response = await api.get(url);
  return response.data;
};

// 互換性のため
export const getTimeline = fetchLiveList;

export const registerToken = async (token: string) => {
  try { await api.post('/register-token', { token }); } catch (e) {}
};
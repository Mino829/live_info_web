import { Platform } from 'react-native';

const getServerUrl = () => {
  // RenderのURLを設定している場合はそのまま（末尾スラッシュなし）
   return 'https://liveinfo-7gxe.onrender.com';
  
  // ローカル開発用
  //if (Platform.OS === 'android') return 'http://10.0.2.2:3000';
  //if (Platform.OS === 'web') return 'http://localhost:3000';
  //return 'http://192.168.0.14:8001'; // ←あなたのPCのIPアドレス
  //return 'http://172.31.108.22:8081';//大学の時のIPアドレス
};

// 共通ヘッダー
const getHeaders = (token: string) => ({
  'Content-Type': 'application/json',
  'x-user-token': token,
});


// トークン登録
export const registerToken = async (token: string) => {
  await fetch(`${getServerUrl()}/register-token`, {
    method: 'POST',
    headers: getHeaders(token),
  });
};

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
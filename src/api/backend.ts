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

// アーティスト一覧取得
export const fetchArtists = async (token: string) => {
  const res = await fetch(`${getServerUrl()}/artists`, {
    headers: getHeaders(token),
  });
  return res.json();
};

// アーティスト追加
export const addArtist = async (token: string, name: string, url: string) => {
  const res = await fetch(`${getServerUrl()}/artists`, {
    method: 'POST',
    headers: getHeaders(token),
    body: JSON.stringify({ name, url }),
  });
  if (!res.ok) throw new Error('Failed to add');
  return res.json();
};

// アーティスト削除
export const deleteArtist = async (token: string, id: string) => {
  await fetch(`${getServerUrl()}/artists/${id}`, {
    method: 'DELETE',
    headers: getHeaders(token),
  });
};

// アーティストミュート切替
export const toggleMuteArtist = async (token: string, id: string, muted: boolean) => {
  const res = await fetch(`${getServerUrl()}/artists/${id}/mute`, {
    method: 'PATCH',
    headers: getHeaders(token),
    body: JSON.stringify({ muted }),
  });
  if (!res.ok) throw new Error('Failed to mute');
  return res.json();
};

// ★★★ 修正箇所：range引数を追加 ★★★
// ライブ一覧取得
export const fetchLiveList = async (token: string, range?: string) => {
  // range='all' があればクエリに追加
  const query = range ? `?range=${range}` : '';
  const res = await fetch(`${getServerUrl()}/live${query}`, {
    headers: getHeaders(token),
  });
  if (!res.ok) throw new Error('Failed to fetch lives');
  return res.json();
};
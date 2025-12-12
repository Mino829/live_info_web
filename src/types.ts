// ライブ情報の型定義
export interface LiveEvent {
  artist: string; // アーティスト名
  title: string;  // ライブタイトル
  date: string;   // 日付 (YYYY-MM-DD推称)
  place: string;  // 会場
  link: string;   // 詳細URL（ユニークキーとして使用）
}
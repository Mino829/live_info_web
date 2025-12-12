import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, RefreshControl, TouchableOpacity, Linking } from 'react-native';
import { fetchLiveList } from '../api/backend';

// ライブ一覧画面コンポーネント
export default function LiveList() {
  const [lives, setLives] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  // データ読み込み関数
  const loadData = async () => {
    setRefreshing(true);
    const data = await fetchLiveList();
    // 日付順にソート
    const sorted = data.sort((a, b) => new Date(a.date) - new Date(b.date));
    setLives(sorted);
    setRefreshing(false);
  };

  // 初回データ読み込み
  useEffect(() => {
    loadData();
  }, []);

  // 各ライブアイテムのレンダリング
  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.artist}>{item.artist}</Text>
        <Text style={styles.date}>{item.date}</Text>
      </View>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.place}>@ {item.place}</Text>
      <TouchableOpacity onPress={() => Linking.openURL(item.link)}>
        <Text style={styles.link}>詳細リンクへ &gt;</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>LivePulse</Text>
      </View>
      <FlatList
        data={lives}
        keyExtractor={(item) => item.link}
        renderItem={renderItem}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={loadData} tintColor="#fff" />
        }
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

// スタイル定義
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212', // ダークテーマ背景
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: '#000',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  listContent: {
    padding: 20,
  },
  card: {
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#BB86FC', // アクセントカラー
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  artist: {
    color: '#BB86FC',
    fontWeight: 'bold',
    fontSize: 14,
  },
  date: {
    color: '#A0A0A0',
    fontSize: 14,
  },
  title: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  place: {
    color: '#ccc',
    fontSize: 14,
    marginBottom: 12,
  },
  link: {
    color: '#03DAC6',
    fontSize: 14,
    fontWeight: '600',
  },
});
import React, { useEffect, useState } from 'react';
import { 
  StyleSheet, View, Text, FlatList, RefreshControl, 
  TouchableOpacity, Linking, SafeAreaView, Platform, Alert, Image, TextInput // ★TextInput追加
} from 'react-native';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { fetchLiveList, registerToken } from '../../src/api/backend';
import { usePushToken } from '../../src/hooks/usePushToken';

type LiveItem = {
  id?: string;
  artist: string;
  title: string;
  date: string;
  place: string;
  link: string;
  image?: string;
  sourceUrl?: string;
};

export default function HomeScreen() {
  const [lives, setLives] = useState<LiveItem[]>([]);
  const [filteredLives, setFilteredLives] = useState<LiveItem[]>([]); // ★表示用（フィルタ後）
  const [searchText, setSearchText] = useState(''); // ★検索文字

  const [refreshing, setRefreshing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const token = usePushToken();

  useEffect(() => {
    if (token) {
      registerToken(token).catch(e => console.error(e));
      loadData();
    }
  }, [token]);

  // ★検索処理（テキストが変わるたびに実行）
  useEffect(() => {
    if (searchText.trim() === '') {
      setFilteredLives(lives);
    } else {
      const lowerText = searchText.toLowerCase();
      const filtered = lives.filter(item => 
        item.title.toLowerCase().includes(lowerText) || 
        item.artist.toLowerCase().includes(lowerText) ||
        item.place.toLowerCase().includes(lowerText)
      );
      setFilteredLives(filtered);
    }
  }, [searchText, lives]);

  const loadData = async () => {
    if (!token) return;
    setRefreshing(true);
    setErrorMsg('');
    try {
      const data = await fetchLiveList(token);
      const sorted = Array.isArray(data) 
        ? data.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()) // 新しい順
        : [];
      setLives(sorted);
    } catch (e: any) {
      setErrorMsg(`通信エラー: ${e.message}`);
    } finally {
      setRefreshing(false);
    }
  };

  const renderItem = ({ item }: { item: LiveItem }) => (
    <View style={styles.card}>
      {item.image && (
        <Image source={{ uri: item.image }} style={styles.cardImage} resizeMode="cover" />
      )}
      <View style={styles.cardContent}>
        <View style={styles.headerRow}>
          <Text style={styles.artist}>{item.artist}</Text>
          <Text style={styles.date}>{item.date}</Text>
        </View>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.place}>@ {item.place}</Text>
        <TouchableOpacity 
          style={styles.linkButton}
          onPress={() => Linking.openURL(item.link).catch(() => Alert.alert('エラー', 'リンクが開けません'))}
        >
          <Text style={styles.linkText}>詳細ページへ</Text>
          <Ionicons name="chevron-forward" size={16} color="#03DAC6" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>LivePulse</Text>
        <View style={[styles.statusDot, { backgroundColor: token ? '#03DAC6' : '#CF6679' }]} />
      </View>

      {/* ★★★ 検索バー ★★★ */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#888" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="キーワードで検索 (例: ツアー, 東京)"
          placeholderTextColor="#888"
          value={searchText}
          onChangeText={setSearchText}
          returnKeyType="search"
        />
        {searchText.length > 0 && (
          <TouchableOpacity onPress={() => setSearchText('')}>
            <Ionicons name="close-circle" size={20} color="#888" />
          </TouchableOpacity>
        )}
      </View>

      {errorMsg ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{errorMsg}</Text>
          <TouchableOpacity onPress={loadData}><Text style={styles.retryText}>再試行</Text></TouchableOpacity>
        </View>
      ) : null}

      <FlatList
        data={filteredLives} // ★フィルタ後のデータを表示
        keyExtractor={(item, index) => item.id || (item.link + index)}
        renderItem={renderItem}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={loadData} tintColor="#BB86FC" />
        }
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          !errorMsg ? (
            <Text style={styles.emptyText}>
              {lives.length === 0 ? (token ? "情報がありません" : "初期化中...") : "検索結果なし"}
            </Text>
          ) : null
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: Platform.OS === 'android' ? 40 : 20, paddingBottom: 15, paddingHorizontal: 20,
    backgroundColor: '#000', borderBottomWidth: 1, borderBottomColor: '#333',
  },
  headerTitle: { color: '#fff', fontSize: 28, fontFamily: 'Oswald_700Bold', letterSpacing: 2 },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  
  // ★検索バーのデザイン
  searchContainer: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#1E1E1E', margin: 15, marginBottom: 5, paddingHorizontal: 15,
    borderRadius: 8, height: 45,
  },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, color: '#fff', fontSize: 16 },

  listContent: { padding: 15, paddingBottom: 100 },
  card: {
    backgroundColor: '#1E1E1E', borderRadius: 12, marginBottom: 16, overflow: 'hidden',
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84, elevation: 5,
  },
  cardImage: { width: '100%', height: 150, backgroundColor: '#333' },
  cardContent: { padding: 20, borderLeftWidth: 4, borderLeftColor: '#BB86FC' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  artist: { color: '#BB86FC', fontSize: 14, fontFamily: 'Oswald_400Regular', fontWeight: 'bold' },
  date: { color: '#A0A0A0', fontSize: 14 },
  title: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 8, lineHeight: 24 },
  place: { color: '#ccc', fontSize: 14, marginBottom: 16 },
  linkButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end' },
  linkText: { color: '#03DAC6', fontSize: 14, fontWeight: '600', marginRight: 4 },
  errorContainer: { margin: 20, padding: 20, backgroundColor: '#330000', borderRadius: 8, alignItems: 'center' },
  errorText: { color: '#ffaaaa', marginBottom: 10 },
  retryText: { color: '#fff', fontWeight: 'bold' },
  emptyText: { color: '#888', textAlign: 'center', marginTop: 50 },
});
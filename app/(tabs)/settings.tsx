import React, { useState, useEffect } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, 
  Alert, SafeAreaView, LayoutAnimation, Platform, UIManager, Keyboard 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { usePushToken } from '../../src/hooks/usePushToken';
import { fetchArtists, addArtist, deleteArtist, toggleMuteArtist } from '../../src/api/backend';

// Androidでのアニメーション有効化
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// データ型の定義
type Artist = {
  id: string;
  name: string;
  url: string;
  muted: boolean;
  lastStatus?: 'ok' | 'error';
  lastError?: string;
};

export default function SettingsScreen() {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [newName, setNewName] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [status, setStatus] = useState<'idle' | 'success'>('idle');
  const token = usePushToken();

  // リスト読み込み
  const loadArtists = async () => {
    if (token) {
      try {
        const data = await fetchArtists(token);
        setArtists(data);
      } catch (e) {
        console.error("Load failed", e);
      }
    }
  };

  useEffect(() => { loadArtists(); }, [token]);

  // 追加処理
  const handleAdd = async () => {
    if (!token || !newName || !newUrl) return;

    const tempId = Date.now().toString();
    const tempItem: Artist = { id: tempId, name: newName, url: newUrl, muted: false };
    
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setArtists([tempItem, ...artists]);
    
    const nameToSend = newName;
    const urlToSend = newUrl;

    setNewName('');
    setNewUrl('');
    setStatus('success');
    Keyboard.dismiss();
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    try {
      await addArtist(token, nameToSend, urlToSend);
      await loadArtists(); 
      setTimeout(() => setStatus('idle'), 2000);
    } catch (e) {
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
      Alert.alert('エラー', '通信に失敗しました');
      setArtists(artists.filter(i => i.id !== tempId));
      setNewName(nameToSend);
      setNewUrl(urlToSend);
      setStatus('idle');
    }
  };

  // ★★★ 修正箇所：Web対応の削除処理 ★★★
  const handleDelete = async (id: string) => {
    // 実際に削除を実行する関数
    const executeDelete = async () => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setArtists(artists.filter(i => i.id !== id));
      
      // WebではHapticsが動かないため除外
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      
      if(token) await deleteArtist(token, id);
    };

    // Webの場合: ブラウザ標準の確認ダイアログを使う
    if (Platform.OS === 'web') {
      if (window.confirm("このリストを削除しますか？")) {
        await executeDelete();
      }
      return;
    }

    // スマホの場合: ネイティブのAlertを使う
    Alert.alert(
      "削除の確認",
      "このリストを削除しますか？",
      [
        { text: "キャンセル", style: "cancel" },
        { 
          text: "削除", 
          style: "destructive", 
          onPress: executeDelete 
        }
      ]
    );
  };

  // ミュート切り替え処理
  const handleToggleMute = async (id: string, currentMuted: boolean) => {
    const newMuted = !currentMuted;
    
    setArtists(artists.map(item => 
      item.id === id ? { ...item, muted: newMuted } : item
    ));
    
    if (Platform.OS !== 'web') {
      Haptics.selectionAsync();
    }

    if (token) {
      try {
        await toggleMuteArtist(token, id, newMuted);
      } catch (e) {
        setArtists(artists.map(item => 
          item.id === id ? { ...item, muted: currentMuted } : item
        ));
        Alert.alert('エラー', '設定の変更に失敗しました');
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.inner}>
        <Text style={styles.headerTitle}>My Watch List</Text>
        
        {/* 入力フォーム */}
        <View style={styles.inputContainer}>
          <TextInput 
            style={styles.input} 
            placeholder="Artist Name (e.g. 櫻坂46)" 
            placeholderTextColor="#888" 
            value={newName} 
            onChangeText={setNewName} 
          />
          <TextInput 
            style={styles.input} 
            placeholder="URL (News/Blog/Schedule)" 
            placeholderTextColor="#888" 
            value={newUrl} 
            onChangeText={setNewUrl} 
            autoCapitalize="none" 
            autoCorrect={false}
          />
          <TouchableOpacity 
            style={[styles.addButton, status === 'success' && styles.successBtn]} 
            onPress={handleAdd} 
            disabled={status === 'success' || !newName || !newUrl}>
            {status === 'success' ? 
              <Ionicons name="checkmark" size={24} color="#000"/> : 
              <Text style={styles.btnText}>ADD WATCH LIST</Text>
            }
          </TouchableOpacity>
        </View>

        {/* リスト表示 */}
        <FlatList
          data={artists}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <View style={styles.item}>
              <View style={{flex:1}}>
                <View style={{flexDirection:'row', alignItems:'center', flexWrap:'wrap'}}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  
                  {/* エラーバッジ */}
                  {item.lastStatus === 'error' && (
                    <TouchableOpacity onPress={() => Alert.alert('接続エラー', item.lastError || 'アクセスできませんでした。\nURLが変更された可能性があります。')}>
                      <View style={styles.errorBadge}>
                        <Ionicons name="warning" size={12} color="#fff" style={{marginRight:2}} />
                        <Text style={styles.errorText}>Error</Text>
                      </View>
                    </TouchableOpacity>
                  )}
                </View>
                
                <Text style={styles.itemUrl} numberOfLines={1}>{item.url}</Text>
              </View>

              {/* ミュートボタン */}
              <TouchableOpacity 
                onPress={() => handleToggleMute(item.id, item.muted)} 
                style={[styles.iconButton, { backgroundColor: item.muted ? '#333' : '#333' }]}
              >
                <Ionicons 
                  name={item.muted ? "volume-mute" : "volume-high"} 
                  size={20} 
                  color={item.muted ? "#888" : "#03DAC6"}
                />
              </TouchableOpacity>

              {/* 削除ボタン */}
              <TouchableOpacity onPress={() => handleDelete(item.id)} style={[styles.iconButton, styles.delBtn]}>
                <Ionicons name="trash" size={20} color="#fff"/>
              </TouchableOpacity>
            </View>
          )}
          ListEmptyComponent={<Text style={styles.empty}>リストは空です</Text>}
          refreshing={false}
          onRefresh={loadArtists}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  inner: { padding: 20, flex: 1 },
  headerTitle: { color: '#fff', fontSize: 24, fontFamily: 'Oswald_700Bold', marginBottom: 20, marginTop: Platform.OS === 'android' ? 30 : 0 },
  
  inputContainer: { marginBottom: 30 },
  input: { backgroundColor: '#1E1E1E', color: '#fff', padding: 15, borderRadius: 8, marginBottom: 10 },
  addButton: { backgroundColor: '#BB86FC', padding: 15, borderRadius: 8, alignItems: 'center', height: 50, justifyContent: 'center' },
  successBtn: { backgroundColor: '#03DAC6' },
  btnText: { color: '#000', fontWeight: 'bold' },
  
  item: { flexDirection: 'row', backgroundColor: '#1E1E1E', padding: 15, borderRadius: 8, marginBottom: 10, alignItems: 'center' },
  itemName: { color: '#fff', fontWeight: 'bold', fontSize: 16, marginRight: 8 },
  itemUrl: { color: '#888', fontSize: 12, marginTop: 4 },
  
  iconButton: { 
    width: 40, height: 40, borderRadius: 8, 
    alignItems: 'center', justifyContent: 'center', marginLeft: 8 
  },
  delBtn: { backgroundColor: '#CF6679' },
  empty: { color: '#888', textAlign: 'center', marginTop: 20 },

  errorBadge: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#CF6679', borderRadius: 4,
    paddingHorizontal: 6, paddingVertical: 2,
  },
  errorText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
});
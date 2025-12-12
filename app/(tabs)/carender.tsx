import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, View, Text, FlatList, TouchableOpacity, Linking, SafeAreaView, Platform, Alert, Image 
} from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { Ionicons } from '@expo/vector-icons';
import { fetchLiveList } from '../../src/api/backend';
import { usePushToken } from '../../src/hooks/usePushToken';

// カレンダーの日本語化設定
LocaleConfig.locales['jp'] = {
  monthNames: ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'],
  monthNamesShort: ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'],
  dayNames: ['日曜日','月曜日','火曜日','水曜日','木曜日','金曜日','土曜日'],
  dayNamesShort: ['日','月','火','水','木','金','土'],
  today: '今日'
};
LocaleConfig.defaultLocale = 'jp';

type LiveItem = {
  id?: string;
  artist: string;
  title: string;
  date: string; // YYYY-MM-DD
  place: string;
  link: string;
  image?: string;
};

export default function CalendarScreen() {
  const [items, setItems] = useState<LiveItem[]>([]);
  const [markedDates, setMarkedDates] = useState<any>({});
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedItems, setSelectedItems] = useState<LiveItem[]>([]);
  const token = usePushToken();

  useEffect(() => {
    if (token) loadData();
  }, [token]);

  const loadData = async () => {
    if (!token) return;
    try {
      // ★★★ ここが重要：'all' を渡して過去1年分の全データを取得 ★★★
      const data: LiveItem[] = await fetchLiveList(token, 'all');
      setItems(data);

      // カレンダー用にデータを変換（紫色のドットを表示）
      const marks: any = {};
      data.forEach(item => {
        marks[item.date] = { marked: true, dotColor: '#BB86FC' };
      });
      setMarkedDates(marks);

      // 初期表示時は「今日」を選択状態にする
      const today = new Date().toISOString().split('T')[0];
      handleDayPress(today, data);

    } catch (e) {
      console.error(e);
    }
  };

  // 日付タップ時の処理
  const handleDayPress = (date: string, allItems: LiveItem[] = items) => {
    setSelectedDate(date);
    // その日のライブだけ抽出してリスト表示
    const filtered = allItems.filter(i => i.date === date);
    setSelectedItems(filtered);
  };

  // リストの各項目（サムネイル付き）
  const renderItem = ({ item }: { item: LiveItem }) => (
    <View style={styles.card}>
      <View style={{flexDirection:'row', alignItems:'center'}}>
        {item.image && (
          <Image source={{ uri: item.image }} style={styles.thumb} resizeMode="cover" />
        )}
        <View style={{flex:1}}>
          <Text style={styles.artist}>{item.artist}</Text>
          <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
        </View>
      </View>
      <TouchableOpacity 
        style={styles.linkButton}
        onPress={() => Linking.openURL(item.link).catch(()=>Alert.alert('エラー','リンクが開けません'))}
      >
        <Text style={styles.linkText}>詳細へ</Text>
        <Ionicons name="chevron-forward" size={14} color="#03DAC6" />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.headerTitle}>Calendar</Text>
      
      <Calendar
        // ダークモード風のデザイン設定
        theme={{
          backgroundColor: '#121212',
          calendarBackground: '#1E1E1E',
          textSectionTitleColor: '#b6c1cd',
          selectedDayBackgroundColor: '#BB86FC',
          selectedDayTextColor: '#000',
          todayTextColor: '#03DAC6',
          dayTextColor: '#fff',
          textDisabledColor: '#444',
          monthTextColor: '#fff',
          arrowColor: '#BB86FC',
          textDayFontWeight: '300',
          textMonthFontWeight: 'bold',
          textDayHeaderFontWeight: '300',
          textDayFontSize: 16,
          textMonthFontSize: 16,
          textDayHeaderFontSize: 14
        }}
        // マーカー設定（選択中の日付は色を変える）
        markedDates={{
          ...markedDates,
          [selectedDate]: { 
            ...(markedDates[selectedDate] || {}), 
            selected: true, 
            selectedColor: '#BB86FC' 
          }
        }}
        onDayPress={(day: any) => handleDayPress(day.dateString)}
      />

      <View style={styles.listContainer}>
        <Text style={styles.dateTitle}>
          {selectedDate || '日付を選択してください'}
        </Text>
        
        <FlatList
          data={selectedItems}
          keyExtractor={(item, index) => item.id || index.toString()}
          renderItem={renderItem}
          ListEmptyComponent={
            <Text style={styles.emptyText}>この日の予定はありません</Text>
          }
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  headerTitle: { 
    color: '#fff', fontSize: 24, fontFamily: 'Oswald_700Bold', 
    margin: 20, marginTop: Platform.OS === 'android' ? 40 : 20 
  },
  listContainer: { flex: 1, padding: 20 },
  dateTitle: { color: '#ccc', fontSize: 18, marginBottom: 15, fontWeight:'bold' },
  
  card: {
    backgroundColor: '#1E1E1E', borderRadius: 8, padding: 15, marginBottom: 10,
    borderLeftWidth: 3, borderLeftColor: '#BB86FC'
  },
  thumb: { width: 40, height: 40, borderRadius: 4, marginRight: 10, backgroundColor:'#333' },
  artist: { color: '#BB86FC', fontSize: 12, fontWeight: 'bold' },
  title: { color: '#fff', fontSize: 14, marginVertical: 4 },
  linkButton: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 5 },
  linkText: { color: '#03DAC6', fontSize: 12, marginRight: 2 },
  emptyText: { color: '#666', marginTop: 20, textAlign: 'center' }
});
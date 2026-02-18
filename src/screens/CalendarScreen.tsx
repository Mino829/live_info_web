import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Linking, Image } from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { useNavigation } from '@react-navigation/native';
import { fetchLiveList } from '../api/backend';

// 日本語化設定
LocaleConfig.locales['jp'] = {
  monthNames: ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'],
  monthNamesShort: ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'],
  dayNames: ['日曜日','月曜日','火曜日','水曜日','木曜日','金曜日','土曜日'],
  dayNamesShort: ['日','月','火','水','木','金','土'],
  today: '今日'
};
LocaleConfig.defaultLocale = 'jp';

// 今日の日付を「YYYY-MM-DD」形式で取得する関数
const getTodayString = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = ('0' + (d.getMonth() + 1)).slice(-2);
  const day = ('0' + d.getDate()).slice(-2);
  return `${year}-${month}-${day}`;
};

export default function CalendarScreen() {
  const navigation = useNavigation();
  const [items, setItems] = useState<any[]>([]);
  // 初期値を「今日」にする
  const [selectedDate, setSelectedDate] = useState(getTodayString());

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // 過去データも含めて全部取得しないとカレンダーにマークがつかないので 'all' で取得
      const data = await fetchLiveList('all'); 
      setItems(data);
    } catch (e) {
      console.error(e);
    }
  };

  // カレンダーに打つドット（マーク）を用意
  const markedDates: any = {
    [selectedDate]: { selected: true, selectedColor: '#BB86FC' } // 選んでいる日
  };

  items.forEach(item => {
    if (item.date) {
      if (!markedDates[item.date]) {
        markedDates[item.date] = { marked: true, dotColor: '#BB86FC' };
      } else {
        markedDates[item.date].marked = true;
      }
    }
  });

  // ★ここがポイント：リストには「選んだ日付」のデータだけを表示する
  const filteredItems = items.filter(item => item.date === selectedDate);

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity onPress={() => Linking.openURL(item.link)}>
      <View style={styles.card}>
        <View style={styles.headerRow}>
          <Text style={styles.date}>{item.date}</Text>
          <Text style={styles.place}>{item.place}</Text>
        </View>
        <Text style={styles.title}>{item.title}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Calendar
        current={selectedDate}
        onDayPress={(day: any) => setSelectedDate(day.dateString)}
        markedDates={markedDates}
        theme={{
          todayTextColor: '#BB86FC',
          arrowColor: '#BB86FC',
          selectedDayBackgroundColor: '#BB86FC',
        }}
      />
      
      <View style={styles.listContainer}>
        <Text style={styles.listHeader}>
          {selectedDate} の予定 ({filteredItems.length}件)
        </Text>
        
        {filteredItems.length === 0 ? (
          <Text style={styles.emptyText}>予定はありません</Text>
        ) : (
          <FlatList
            data={filteredItems}
            keyExtractor={(item, index) => index.toString()}
            renderItem={renderItem}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  listContainer: { flex: 1, padding: 10 },
  listHeader: { fontSize: 18, fontWeight: 'bold', marginBottom: 10, color: '#333' },
  emptyText: { textAlign: 'center', marginTop: 20, color: '#888' },
  card: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    elevation: 2,
  },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  date: { fontSize: 12, color: '#888' },
  place: { fontSize: 12, color: '#BB86FC', fontWeight: 'bold' },
  title: { fontSize: 16, fontWeight: 'bold' },
});
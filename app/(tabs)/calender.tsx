import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { fetchLiveList } from '../../src/api/backend';

LocaleConfig.locales['jp'] = {
  monthNames: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
  monthNamesShort: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
  dayNames: ['日', '月', '火', '水', '木', '金', '土'],
  dayNamesShort: ['日', '月', '火', '水', '木', '金', '土'],
};
LocaleConfig.defaultLocale = 'jp';

export default function CalendarScreen() {
  const [items, setItems] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLiveList('all').then(setItems).catch(console.error).finally(() => setLoading(false));
  }, []);

  const markedDates = items.reduce((acc, item) => {
    acc[item.date] = { marked: true, dotColor: '#BB86FC' };
    return acc;
  }, {} as any);
  markedDates[selectedDate] = { ...markedDates[selectedDate], selected: true, selectedColor: '#BB86FC' };

  const selectedEvents = items.filter(item => item.date === selectedDate);

  if (loading) return <View style={styles.center}><ActivityIndicator color="#BB86FC" /></View>;

  return (
    <View style={styles.container}>
      <ScrollView>
        <Calendar
          current={selectedDate}
          onDayPress={(day: any) => setSelectedDate(day.dateString)}
          markedDates={markedDates}
          theme={{
            backgroundColor: '#000', calendarBackground: '#000',
            todayTextColor: '#BB86FC', dayTextColor: '#fff', monthTextColor: '#fff',
            selectedDayBackgroundColor: '#BB86FC', arrowColor: '#BB86FC'
          }}
        />
        <View style={styles.listContainer}>
          <Text style={styles.dateTitle}>{selectedDate}</Text>
          {selectedEvents.length === 0 ? (
            <Text style={styles.noEvent}>予定なし</Text>
          ) : (
            selectedEvents.map((item, i) => (
              <View key={i} style={styles.card}>
                <Text style={styles.cardArtist}>{item.place || 'Info'}</Text>
                <Text style={styles.cardTitle}>{item.title}</Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' },
  listContainer: { padding: 20 },
  dateTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  noEvent: { color: '#666' },
  card: { backgroundColor: '#1E1E1E', padding: 15, borderRadius: 10, marginBottom: 10, borderLeftWidth: 4, borderLeftColor: '#BB86FC' },
  cardArtist: { color: '#BB86FC', fontSize: 12, fontWeight: 'bold', marginBottom: 4 },
  cardTitle: { color: '#fff', fontSize: 15, lineHeight: 22 }
});
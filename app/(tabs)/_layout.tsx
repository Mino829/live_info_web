import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Platform } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        // ヘッダーは各画面（index.tsxなど）で自作しているので、ここでは非表示にする
        headerShown: false,
        
        // タブバー全体のデザイン（ダークモード）
        tabBarStyle: {
          backgroundColor: '#000000', // 真っ黒な背景
          borderTopColor: '#333333',  // 上の境界線
          borderTopWidth: 1,
          height: Platform.OS === 'android' ? 60 : 88, // スマホに合わせて高さを調整
          paddingBottom: Platform.OS === 'android' ? 10 : 30,
          paddingTop: 10,
        },
        
        // 文字とアイコンの色設定
        tabBarActiveTintColor: '#BB86FC', // 選択中：紫（テーマカラー）
        tabBarInactiveTintColor: '#666666', // 非選択：グレー
        
        // ラベル（文字）のスタイル
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: 'bold',
          fontFamily: Platform.OS === 'ios' ? 'Arial' : 'Roboto', // シンプルなフォント
        },
      }}>

      {/* 1. タイムライン（ホーム） */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Timeline',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              name={focused ? "list" : "list-outline"} 
              size={24} 
              color={color} 
            />
          ),
        }}
      />

      {/* 2. カレンダー（今回追加） */}
      <Tabs.Screen
        name="calendar"
        options={{
          title: 'Calendar',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              name={focused ? "calendar" : "calendar-outline"} 
              size={24} 
              color={color} 
            />
          ),
        }}
      />

      {/* 3. 設定 */}
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              name={focused ? "settings" : "settings-outline"} 
              size={24} 
              color={color} 
            />
          ),
        }}
      />
    </Tabs>
  );
}
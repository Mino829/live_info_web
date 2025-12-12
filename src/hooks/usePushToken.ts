import { useState, useEffect } from 'react';
import { Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 通知ハンドラー設定
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// プッシュ通知トークン取得と保存のカスタムフック
export const usePushToken = () => {
  const [token, setToken] = useState<string | undefined>(undefined);

  useEffect(() => {
    const getAndSaveToken = async () => {
      try {
        const savedToken = await AsyncStorage.getItem('user_push_token');
        if (savedToken) {
          console.log("📂 Using saved token:", savedToken);
          setToken(savedToken);
          return;
        }

        let newToken: string | undefined;
        if (Platform.OS === 'web') {
          newToken = `web-user-${Date.now()}-${Math.random().toString(36).slice(2)}`;
        } else {
          newToken = await registerForPushNotificationsAsync();
        }

        if (newToken) {
          await AsyncStorage.setItem('user_push_token', newToken);
          console.log("💾 Created & Saved new token:", newToken);
          setToken(newToken);
        }
      } catch (e) {
        console.error("Token Error:", e);
      }
    };
    getAndSaveToken();
  }, []);

  return token;
};

async function registerForPushNotificationsAsync() {
  if (!Device.isDevice) return `emulator-${Date.now()}`;
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== 'granted') return `denied-${Date.now()}`;

  try {
    const projectId = Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
    const tokenData = await Notifications.getExpoPushTokenAsync({ projectId });
    return tokenData.data;
  } catch (e) {
    return `error-${Date.now()}`;
  }
}
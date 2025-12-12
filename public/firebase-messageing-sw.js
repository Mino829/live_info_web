// Web通知を受け取るための裏方プログラム（Service Worker）

importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js');

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAed0mPdqRxvUoj-Z3ZBg7rGskVwRYgNCE",
  authDomain: "liveinfo-c5e6e.firebaseapp.com",
  projectId: "liveinfo-c5e6e",
  storageBucket: "liveinfo-c5e6e.firebasestorage.app",
  messagingSenderId: "899250117730",
  appId: "1:899250117730:web:771e811c9505bb2aaf853b",
  measurementId: "G-XM6F2ERFYQ"
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

// バックグラウンド（タブを閉じている時や裏にいる時）の通知処理
messaging.onBackgroundMessage(function(payload) {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/icon.png', // アイコン画像があれば指定
    data: payload.data
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
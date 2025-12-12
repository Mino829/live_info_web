# LivePulse App (Frontend)

推し活支援アプリ「LivePulse」のフロントエンド（スマホアプリ・Web版）です。
React Native (Expo) を使用し、iOS / Android / Web のすべてで動作します。

バックエンドサーバーと連携し、登録したアーティストの最新ニュースを時系列やカレンダー形式で閲覧できます。

## 📱 主な機能

* **Timeline (ホーム画面)**:
    * 直近5日間の最新ニュースをリスト表示。
    * 「未読の情報を逃さない」ことに特化したスッキリしたデザイン。
    * 下に引っ張って更新（Pull to Refresh）に対応。
* **Calendar (カレンダー画面)**:
    * 過去1年分の活動履歴をカレンダー形式で表示。
    * イベントがある日に「●（ドット）」を表示。
    * 日付タップでその日の詳細リストを展開。
* **Settings (設定画面)**:
    * 好きなアーティストの公式サイトURLを登録・管理。
    * 特定のアーティストの通知をOFFにする「ミュート機能」。
    * サイトが落ちている、URLが変わった等を検知する「エラーバッジ（⚠️）」表示。
* **通知機能**:
    * アプリを閉じていても更新情報が届くプッシュ通知（Expo Push / Web Push）。
    * Web版はPWA（Progressive Web Apps）に対応。

## 📖 使い方ガイド (User Manual)

### 1. アーティストを登録する
1. 下部タブの **[Settings]** を開きます。
2. **Artist Name** に名前（例: `King Gnu`）を入力します。
3. **URL** に公式サイトのニュースページ等のURLを入力します。
4. **[ADD WATCH LIST]** ボタンを押します。
   * ※ 登録と同時にバックエンドでスクレイピングが走り、最新情報が取得されます。
   * ※ 自動的にDiscordの通知チャンネルも作成されます。

### 2. 最新情報をチェックする
1. 下部タブの **[Timeline]** を開きます。
2. ここ数日のニュースが新しい順に並びます。
3. 気になる記事をタップすると、ブラウザで詳細ページが開きます。
4. **画面を下に引っ張る** と、最新の状態に更新されます。

### 3. 過去の活動を振り返る
1. 下部タブの **[Calendar]** を開きます。
2. カレンダー上の「●」が付いている日付をタップします。
3. 画面下部に、その日のイベントやニュースが表示されます。

### 4. 通知を受け取る
* **スマホアプリ版**: インストール後、通知の許可を求められるので「許可」してください。
* **Web版 (iPhone)**: Safariの「共有」ボタンから **「ホーム画面に追加」** してください。そのアイコンから起動すると通知が届きます。
* **Web版 (PC/Android)**: ブラウザの通知許可をONにしてください。

## 🛠️ 技術スタック

* **Framework**: React Native (Expo SDK 50+)
* **Platform**: iOS, Android, Web
* **Routing**: Expo Router
* **UI/UX**: React Native Calendars, Expo Vector Icons, LayoutAnimation
* **Notifications**: Expo Notifications
* **Deployment**:
    * Web: Render (Static Site)
    * Android: EAS Build (APK)

## 📦 インストールと開発

### 1. 依存関係のインストール
```bash
cd mobile
npm install
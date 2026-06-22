# セットアップガイド（Windows）

## 必要なもの
- Windows PC
- Google Chrome
- Python 3.x（以下の手順でインストール）

---

## STEP 1 — Pythonをインストール

1. https://www.python.org/downloads/ を開く
2. **「Download Python 3.x.x」** をクリックしてインストーラーを実行
3. ⚠️ **「Add Python to PATH」に必ずチェックを入れる**
4. **「Install Now」** をクリック
5. インストール後、コマンドプロンプトを**一度閉じて開き直す**

---

## STEP 2 — ライブラリをインストール

コマンドプロンプトでプロジェクトフォルダに移動して実行：

```bash
cd C:\Users\ユーザー名\Desktop\x-video-downloader
python -m pip install -r requirements.txt
python -m pip install yt-dlp
```

## STEP 3 — Chrome拡張機能を読み込む

1. Chromeで `chrome://extensions/` を開く
2. 右上の **「デベロッパーモード」をON**
3. **「パッケージ化されていない拡張機能を読み込む」** をクリック
4. `x-video-downloader\extension` フォルダを選択

> 拡張機能を更新した場合は 🔄 更新ボタンを押してから x.com のタブも F5 で更新する

---

## STEP 4 — バックエンドを起動

```bash
python backend/server.py
```

以下のように表示されれば成功：

```
📁 保存先フォルダ: C:\...\downloads
🚀 X動画ダウンローダー バックエンド起動
   ポート: 5566
   * Running on http://127.0.0.1:5566
```

> このコマンドプロンプトは**開けたまま**にしておく

---

## STEP 5 — x.com をスクロールするだけ

https://x.com を開いてタイムラインをスクロールすると、動画が自動で `downloads\` フォルダに保存されます。

コマンドプロンプトに以下のように表示されれば成功：

```
🎬 動画検出: https://x.com/xxx/status/xxx
   ダウンロード中...
   ✅ ダウンロード成功
   📊 累計: 1件DL / 0件スキップ / 0件失敗
```

---

## 動作確認

ブラウザで以下にアクセスしてサーバーの状態を確認できます：

```
http://127.0.0.1:5566/status
```

---

## トラブルシューティング

| 症状 | 原因 | 対処 |
|------|------|------|
| `pip` が認識されない | PATHが通っていない | `python -m pip` を使う |
| `yt-dlp` が認識されない | PATHが通っていない | `server.py` を `python -m yt_dlp` に修正 |
| ポップアップが「確認中」のまま | CSPエラー | `popup.js` を別ファイルに分離する |
| 動画が検出されない | 拡張機能が古い | 🔄更新 → x.com を F5 更新 |
| ダウンロード失敗が続く | yt-dlp未インストール | `python -m pip install yt-dlp` を実行 |

FFmpegをインストールする

https://www.gyan.dev/ffmpeg/builds/ を開く
「ffmpeg-release-essentials.zip」 をダウンロード
ZIPを展開して中の bin フォルダのパスをコピー

（例: C:\ffmpeg\bin）
Windowsの「環境変数」に追加：

スタートメニューで「環境変数」と検索
「システム環境変数の編集」→「環境変数」
Path を選択して「編集」→「新規」
C:\ffmpeg\bin を追加してOK


コマンドプロンプトを再起動して確認：

bashffmpeg -version

FFmpegが入ればyt-dlpが自動で映像と音声を結合して1つのmp4ファイルとして保存されます。サーバーの再起動も忘れずに！


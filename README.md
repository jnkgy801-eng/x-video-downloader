# X (Twitter) 動画自動ダウンローダー

Xのタイムラインをスクロールしている際に動画を自動検出し、ローカルフォルダに保存するツールです。

## 仕組み

```
[Chrome拡張機能] → 動画URLを検出 → [Pythonバックエンド] → 動画をダウンロード → [保存フォルダ]
```

1. **Chrome拡張機能**: X上の動画URLをリアルタイム検出してバックエンドに送信
2. **Pythonバックエンド**: yt-dlpで動画をダウンロードしてフォルダ保存

## 必要環境

- Python 3.8+
- Google Chrome
- yt-dlp
- X (Twitter) のアカウント（ログイン済み）

## セットアップ

### 1. リポジトリをクローン

```bash
git clone https://github.com/yourusername/x-video-downloader.git
cd x-video-downloader
```

### 2. Pythonの依存関係をインストール

```bash
pip install -r requirements.txt
```

### 3. Chrome拡張機能をインストール

1. Chromeで `chrome://extensions/` を開く
2. 右上の「デベロッパーモード」をON
3. 「パッケージ化されていない拡張機能を読み込む」をクリック
4. `extension/` フォルダを選択

### 4. バックエンドサーバーを起動

```bash
python backend/server.py
```

起動すると `downloads/` フォルダが自動作成されます。

### 5. Xをブラウジング

Chromeで https://x.com にアクセスしてタイムラインをスクロールするだけで、動画が自動ダウンロードされます。

## 設定

`backend/config.py` で以下を変更できます：

| 設定項目 | デフォルト | 説明 |
|---------|-----------|------|
| `DOWNLOAD_DIR` | `./downloads` | 保存先フォルダ |
| `SERVER_PORT` | `5566` | バックエンドのポート番号 |
| `VIDEO_QUALITY` | `best` | 動画品質 (`best`, `worst`, `720p`など) |
| `FILENAME_FORMAT` | `%(uploader)s_%(id)s` | ファイル名フォーマット |

## フォルダ構成

```
x-video-downloader/
├── extension/          # Chrome拡張機能
│   ├── manifest.json
│   ├── background.js
│   ├── content.js
│   └── popup.html
├── backend/            # Pythonサーバー
│   ├── server.py
│   └── config.py
├── downloads/          # 動画保存先（自動作成）
├── requirements.txt
└── README.md
```

## トラブルシューティング

**動画がダウンロードされない場合**
- バックエンドサーバーが起動しているか確認: `http://localhost:5566/status`
- Chromeの拡張機能が有効になっているか確認

**ファイルが壊れている場合**
- yt-dlpを最新版に更新: `pip install -U yt-dlp`

**レート制限エラー**
- Xのレート制限により一時的にダウンロードできない場合があります。しばらく待ってください。

## 注意事項

- ダウンロードした動画の著作権は元の投稿者に帰属します
- 個人利用の範囲内でご使用ください
- Xの利用規約に従ってご使用ください

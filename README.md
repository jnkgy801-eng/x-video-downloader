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

---

## STEP 3 — server.py を修正（重要）

`backend/server.py` をメモ帳で開いて以下の行を探す：

```python
cmd = [
    "yt-dlp",
```

以下に変更して保存：

```python
cmd = [
    "python", "-m", "yt_dlp",
```

---

## STEP 4 — Chrome拡張機能のファイルを修正

### extension/content.js
`extension/content.js` をメモ帳で開いて中身を全部消して以下を貼り付け：

```javascript
const BACKEND_URL = "http://127.0.0.1:5566/download";
const sentUrls = new Set();

function extractTweetUrl(element) {
  const links = element.querySelectorAll('a[href*="/status/"]');
  for (const link of links) {
    const match = link.href.match(/https?:\/\/(x|twitter)\.com\/[^/]+\/status\/\d+/);
    if (match) return match[0];
  }
  const timeLinks = element.querySelectorAll('time');
  for (const time of timeLinks) {
    const a = time.closest('a');
    if (a) {
      const match = a.href.match(/https?:\/\/(x|twitter)\.com\/[^/]+\/status\/\d+/);
      if (match) return match[0];
    }
  }
  return null;
}

async function sendToBackend(tweetUrl) {
  try {
    const response = await fetch(BACKEND_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: tweetUrl }),
    });
    if (response.ok) {
      console.log(`[X動画DL] 送信成功: ${tweetUrl}`);
    }
  } catch (err) {
    // サーバー未起動時は無視
  }
}

function scanForVideos() {
  const articles = document.querySelectorAll('article');
  articles.forEach((article) => {
    const hasVideo =
      article.querySelector('video') ||
      article.querySelector('[data-testid="videoPlayer"]') ||
      article.querySelector('[data-testid="videoComponent"]') ||
      article.querySelector('div[aria-label*="動画"]') ||
      article.querySelector('div[aria-label*="Video"]');
    if (!hasVideo) return;
    const tweetUrl = extractTweetUrl(article);
    if (!tweetUrl) return;
    if (sentUrls.has(tweetUrl)) return;
    sentUrls.add(tweetUrl);
    console.log(`[X動画DL] 動画ツイート検出: ${tweetUrl}`);
    sendToBackend(tweetUrl);
  });
}

const observer = new MutationObserver(() => {
  clearTimeout(observer._timer);
  observer._timer = setTimeout(scanForVideos, 500);
});
observer.observe(document.body, { childList: true, subtree: true });
setTimeout(scanForVideos, 2000);

let lastUrl = location.href;
new MutationObserver(() => {
  if (location.href !== lastUrl) {
    lastUrl = location.href;
    sentUrls.clear();
    setTimeout(scanForVideos, 2000);
  }
}).observe(document, { subtree: true, childList: true });

console.log("[X動画DL] 監視開始 - バックエンド:", BACKEND_URL);
```

### extension/popup.html
`extension/popup.html` をメモ帳で開いて中身を全部消して以下を貼り付け：

```html
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <title>X動画ダウンローダー</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { width: 300px; font-family: sans-serif; background: #0f1117; color: #e7e9ea; }
    .header { padding: 16px; background: #1d9bf0; display: flex; align-items: center; gap: 10px; }
    .header h1 { font-size: 15px; font-weight: 700; }
    .header p { font-size: 11px; opacity: 0.85; margin-top: 2px; }
    .section { padding: 14px 16px; border-bottom: 1px solid #2f3336; }
    .status-row { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; }
    .dot { width: 8px; height: 8px; border-radius: 50%; background: #71767b; }
    .dot.online { background: #00ba7c; }
    .dot.offline { background: #f4212e; }
    .stat-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; }
    .stat-box { background: #16181c; border: 1px solid #2f3336; border-radius: 8px; padding: 10px 8px; text-align: center; }
    .stat-num { font-size: 22px; font-weight: 700; color: #1d9bf0; }
    .stat-label { font-size: 10px; color: #71767b; margin-top: 3px; }
    .footer { padding: 12px 16px; font-size: 11px; color: #71767b; line-height: 1.5; }
    .badge { display: inline-block; padding: 2px 7px; border-radius: 4px; font-size: 10px; font-weight: 600; background: #2f3336; color: #71767b; }
    .badge.active { background: #0a3d28; color: #00ba7c; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <h1>X動画自動ダウンローダー</h1>
      <p>閲覧した動画を自動保存</p>
    </div>
  </div>
  <div class="section">
    <div class="status-row">
      <div class="dot" id="statusDot"></div>
      <span id="statusText">確認中...</span>
      <span class="badge" id="statusBadge">-</span>
    </div>
    <div class="stat-grid">
      <div class="stat-box"><div class="stat-num" id="statDownloaded">-</div><div class="stat-label">ダウンロード</div></div>
      <div class="stat-box"><div class="stat-num" id="statSkipped">-</div><div class="stat-label">スキップ</div></div>
      <div class="stat-box"><div class="stat-num" id="statFailed">-</div><div class="stat-label">失敗</div></div>
    </div>
  </div>
  <div class="footer">保存先: <span id="downloadDir">—</span></div>
  <script src="popup.js"></script>
</body>
</html>
```

### extension/popup.js（新規作成）
`extension/` フォルダに **`popup.js`** という新しいファイルを作成して以下を貼り付け：

```javascript
const BACKEND = "http://127.0.0.1:5566";

async function refresh() {
  try {
    const res = await fetch(`${BACKEND}/status`, { signal: AbortSignal.timeout(2000) });
    const data = await res.json();
    document.getElementById("statusDot").className = "dot online";
    document.getElementById("statusText").textContent = "バックエンド稼働中";
    document.getElementById("statusBadge").className = "badge active";
    document.getElementById("statusBadge").textContent = "接続済";
    document.getElementById("statDownloaded").textContent = data.stats.total_downloaded;
    document.getElementById("statSkipped").textContent = data.stats.total_skipped;
    document.getElementById("statFailed").textContent = data.stats.total_failed;
    document.getElementById("downloadDir").textContent = data.download_dir || "—";
  } catch {
    document.getElementById("statusDot").className = "dot offline";
    document.getElementById("statusText").textContent = "バックエンド未起動";
    document.getElementById("statusBadge").className = "badge";
    document.getElementById("statusBadge").textContent = "未接続";
    ["statDownloaded", "statSkipped", "statFailed"].forEach(id => {
      document.getElementById(id).textContent = "—";
    });
  }
}

refresh();
setInterval(refresh, 3000);
```

---

## STEP 5 — Chrome拡張機能を読み込む

1. Chromeで `chrome://extensions/` を開く
2. 右上の **「デベロッパーモード」をON**
3. **「パッケージ化されていない拡張機能を読み込む」** をクリック
4. `x-video-downloader\extension` フォルダを選択

> 拡張機能を更新した場合は 🔄 更新ボタンを押してから x.com のタブも F5 で更新する

---

## STEP 6 — バックエンドを起動

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

## STEP 7 — x.com をスクロールするだけ

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

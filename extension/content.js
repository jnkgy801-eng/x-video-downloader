/**
 * X (Twitter) 動画自動ダウンローダー - コンテンツスクリプト
 * タイムライン上の動画URLを検出してバックエンドに送信します。
 */

const BACKEND_URL = "http://localhost:5566/download";
const sentUrls = new Set();

/**
 * ツイートURLからX動画のダウンロードURLを生成する
 * video.twimg.com の直リンクではなく、ツイートのURLをyt-dlpに渡す
 */
function extractTweetUrl(element) {
  // ツイートのリンク（ツイート詳細ページのURL）を探す
  const links = element.querySelectorAll('a[href*="/status/"]');
  for (const link of links) {
    const href = link.href;
    const match = href.match(/https?:\/\/(x|twitter)\.com\/[^/]+\/status\/\d+/);
    if (match) {
      return match[0];
    }
  }
  return null;
}

/**
 * 動画を含むツイート要素を検索してダウンロードリクエストを送る
 */
function scanForVideos() {
  // Xの動画プレーヤーを含む要素を検索
  const videoElements = document.querySelectorAll(
    'div[data-testid="videoPlayer"] video, ' +
    'div[data-testid="videoComponent"] video, ' +
    'video[src*="video.twimg.com"], ' +
    'video[src*="amp.twimg.com"]'
  );

  videoElements.forEach((video) => {
    // 親のツイート要素を探す（article タグ）
    const article = video.closest('article');
    if (!article) return;

    // ツイートURLを取得
    const tweetUrl = extractTweetUrl(article);
    if (!tweetUrl) return;

    // 重複送信を防ぐ
    if (sentUrls.has(tweetUrl)) return;
    sentUrls.add(tweetUrl);

    // 動画が実際に読み込まれているか確認（src属性またはsource子要素）
    const hasSrc = video.src && video.src.includes("twimg.com");
    const hasSource = video.querySelector('source[src*="twimg.com"]');
    if (!hasSrc && !hasSource) return;

    sendToBackend(tweetUrl);
  });
}

/**
 * バックエンドサーバーにダウンロードリクエストを送信
 */
async function sendToBackend(tweetUrl) {
  try {
    const response = await fetch(BACKEND_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: tweetUrl }),
    });

    if (response.ok) {
      console.log(`[X動画DL] ダウンロード送信: ${tweetUrl}`);
    } else {
      console.warn(`[X動画DL] バックエンドエラー: ${response.status}`);
    }
  } catch (err) {
    // バックエンドが起動していない場合は静かに失敗
    if (err.name !== "TypeError") {
      console.warn(`[X動画DL] 送信失敗: ${err.message}`);
    }
  }
}

/**
 * MutationObserver でDOMの変化を監視（スクロール時の動的読み込みに対応）
 */
function startObserver() {
  const observer = new MutationObserver((mutations) => {
    let shouldScan = false;
    for (const mutation of mutations) {
      if (mutation.addedNodes.length > 0) {
        shouldScan = true;
        break;
      }
    }
    if (shouldScan) {
      // デバウンス（連続スキャンを防ぐ）
      clearTimeout(startObserver._timer);
      startObserver._timer = setTimeout(scanForVideos, 300);
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  console.log("[X動画DL] 監視開始 - バックエンド:", BACKEND_URL);
}

// 初回スキャン＋監視開始
scanForVideos();
startObserver();

// ページナビゲーション（SPAルーティング）に対応
let lastUrl = location.href;
new MutationObserver(() => {
  if (location.href !== lastUrl) {
    lastUrl = location.href;
    setTimeout(scanForVideos, 1000);
  }
}).observe(document, { subtree: true, childList: true });

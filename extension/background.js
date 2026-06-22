/**
 * バックグラウンドサービスワーカー
 * 拡張機能の状態管理とコンテンツスクリプトとの通信を担当
 */

chrome.runtime.onInstalled.addListener(() => {
  console.log("[X動画DL] 拡張機能がインストールされました");
});

// コンテンツスクリプトからのメッセージを受け取る（将来の拡張用）
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "VIDEO_DETECTED") {
    sendResponse({ status: "ok" });
  }
});

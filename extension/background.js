const BACKEND_URL = "http://localhost:5566/download";

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type !== "DOWNLOAD") return;

  fetch(BACKEND_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url: message.url }),
  })
    .then((res) => sendResponse({ ok: res.ok, status: res.status }))
    .catch((err) => sendResponse({ ok: false, error: err.message }));

  return true; // 非同期レスポンスに必須
});
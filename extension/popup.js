const BACKEND = "http://localhost:5566";

async function refresh() {
  try {
    const res = await fetch(`${BACKEND}/status`);
    const data = await res.json();

    document.getElementById("statusDot").className = "dot online";
    document.getElementById("statusText").textContent = "バックエンド稼働中";
    document.getElementById("statusBadge").className = "badge active";
    document.getElementById("statusBadge").textContent = "ONLINE";

    document.getElementById("statDownloaded").textContent = data.downloaded ?? 0;
    document.getElementById("statSkipped").textContent = data.skipped ?? 0;
    document.getElementById("statFailed").textContent = data.failed ?? 0;

    if (data.download_dir) {
      document.getElementById("downloadDir").textContent = data.download_dir;
    }
  } catch {
    document.getElementById("statusDot").className = "dot offline";
    document.getElementById("statusText").textContent = "バックエンド未起動";
    document.getElementById("statusBadge").className = "badge";
    document.getElementById("statusBadge").textContent = "OFFLINE";
  }
}

refresh();
setInterval(refresh, 3000);
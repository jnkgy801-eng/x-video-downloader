#!/usr/bin/env python3
"""
X (Twitter) 動画自動ダウンローダー - バックエンドサーバー
Chrome拡張機能から動画URLを受け取り、yt-dlpでダウンロードします。
"""

import os
import sys
import json
import threading
import subprocess
from datetime import datetime
from flask import Flask, request, jsonify
from flask_cors import CORS

# configをインポート
sys.path.insert(0, os.path.dirname(__file__))
import config

app = Flask(__name__)
CORS(app)  # Chrome拡張からのリクエストを許可

# ダウンロード済みURLのセット（重複防止）
downloaded_urls: set[str] = set()
download_lock = threading.Lock()

# 統計情報
stats = {
    "total_detected": 0,
    "total_downloaded": 0,
    "total_skipped": 0,
    "total_failed": 0,
    "last_download": None,
}


def setup():
    """初期セットアップ"""
    # ダウンロードフォルダを作成
    os.makedirs(config.DOWNLOAD_DIR, exist_ok=True)
    print(f"📁 保存先フォルダ: {os.path.abspath(config.DOWNLOAD_DIR)}")

    # 既存のアーカイブファイルを読み込み
    if config.SKIP_DUPLICATES and os.path.exists(config.ARCHIVE_FILE):
        with open(config.ARCHIVE_FILE, "r") as f:
            for line in f:
                url = line.strip()
                if url:
                    downloaded_urls.add(url)
        print(f"📋 既存ダウンロード記録: {len(downloaded_urls)} 件")


def download_video(url: str):
    """yt-dlpで動画をダウンロード"""
    # 品質設定
    if config.VIDEO_QUALITY == "best":
        format_str = "bestvideo+bestaudio/best"
    elif config.VIDEO_QUALITY == "worst":
        format_str = "worstvideo+worstaudio/worst"
    else:
        # 例: "720p" → height<=720
        height = config.VIDEO_QUALITY.replace("p", "")
        format_str = f"bestvideo[height<={height}]+bestaudio/best[height<={height}]"

    output_template = os.path.join(
        config.DOWNLOAD_DIR, config.FILENAME_FORMAT
    )

    cmd = [
        "yt-dlp",
        "--format", format_str,
        "--output", output_template,
        "--merge-output-format", "mp4",
        "--no-playlist",
        "--no-warnings",
    ]

    # 重複スキップ設定
    if config.SKIP_DUPLICATES:
        cmd += ["--download-archive", config.ARCHIVE_FILE]

    cmd.append(url)

    try:
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=120,
        )
        if result.returncode == 0:
            return True, "ダウンロード成功"
        else:
            # yt-dlpがアーカイブでスキップした場合も returncode=0 なので、
            # エラー出力を確認
            stderr = result.stderr or ""
            if "already been recorded" in stderr or "has already been downloaded" in stderr:
                return None, "スキップ（ダウンロード済み）"
            return False, f"エラー: {result.stderr[:200]}"
    except subprocess.TimeoutExpired:
        return False, "タイムアウト（120秒）"
    except FileNotFoundError:
        return False, "yt-dlpが見つかりません。`pip install yt-dlp` を実行してください。"
    except Exception as e:
        return False, str(e)


def process_url_async(url: str):
    """バックグラウンドで動画をダウンロード"""
    with download_lock:
        if url in downloaded_urls and config.SKIP_DUPLICATES:
            stats["total_skipped"] += 1
            print(f"⏭️  スキップ（記録済み）: {url}")
            return
        downloaded_urls.add(url)

    stats["total_detected"] += 1
    print(f"\n🎬 動画検出: {url}")
    print(f"   ダウンロード中...")

    success, message = download_video(url)

    if success is True:
        stats["total_downloaded"] += 1
        stats["last_download"] = datetime.now().isoformat()
        print(f"   ✅ {message}")
    elif success is None:
        stats["total_skipped"] += 1
        print(f"   ⏭️  {message}")
    else:
        stats["total_failed"] += 1
        print(f"   ❌ {message}")

    print(f"   📊 累計: {stats['total_downloaded']}件DL / {stats['total_skipped']}件スキップ / {stats['total_failed']}件失敗")


# ──────────────────────────────────────────────
# APIエンドポイント
# ──────────────────────────────────────────────

@app.route("/status", methods=["GET"])
def status():
    """サーバー状態確認"""
    return jsonify({
        "status": "running",
        "download_dir": os.path.abspath(config.DOWNLOAD_DIR),
        "stats": stats,
    })


@app.route("/download", methods=["POST"])
def download():
    """動画ダウンロードリクエストを受け付ける"""
    data = request.get_json(silent=True) or {}
    url = data.get("url", "").strip()

    if not url:
        return jsonify({"error": "URLが指定されていません"}), 400

    # URLがX/Twitterのものか確認
    if not any(domain in url for domain in ["twitter.com", "x.com", "t.co"]):
        return jsonify({"error": "X/TwitterのURLではありません"}), 400

    # バックグラウンドでダウンロード開始
    thread = threading.Thread(target=process_url_async, args=(url,), daemon=True)
    thread.start()

    return jsonify({"message": "ダウンロードキューに追加しました", "url": url})


@app.route("/stats", methods=["GET"])
def get_stats():
    """統計情報を返す"""
    return jsonify(stats)


if __name__ == "__main__":
    setup()
    print(f"\n🚀 X動画ダウンローダー バックエンド起動")
    print(f"   ポート: {config.SERVER_PORT}")
    print(f"   品質設定: {config.VIDEO_QUALITY}")
    print(f"   重複スキップ: {'有効' if config.SKIP_DUPLICATES else '無効'}")
    print(f"\n   Chromeで https://x.com を開いて動画をスクロールしてください")
    print(f"   ステータス確認: http://localhost:{config.SERVER_PORT}/status\n")

    app.run(host="127.0.0.1", port=config.SERVER_PORT, debug=False)

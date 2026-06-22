import os

# ダウンロード先フォルダ（絶対パスまたは相対パス）
DOWNLOAD_DIR = os.path.join(os.path.dirname(__file__), "..", "downloads")

# バックエンドサーバーのポート番号
SERVER_PORT = 5566

# 動画品質: "best", "worst", "720p", "1080p" など
VIDEO_QUALITY = "best"

# ファイル名フォーマット (yt-dlp テンプレート)
# 利用可能な変数: %(uploader)s, %(id)s, %(title)s, %(upload_date)s
FILENAME_FORMAT = "%(uploader)s_%(upload_date)s_%(id)s.%(ext)s"

# 同じ動画を重複ダウンロードしないか
SKIP_DUPLICATES = True

# ダウンロード済みURLを記録するファイル
ARCHIVE_FILE = os.path.join(os.path.dirname(__file__), "..", "downloaded.txt")

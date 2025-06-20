-- tmux+claudeMAX教材サイト データベース設計
-- SQLite3用スキーマ

-- ユーザーテーブル
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE,
    password_hash TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 教材章テーブル
CREATE TABLE chapters (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    order_index INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ユーザー進捗テーブル
CREATE TABLE user_progress (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    chapter_id INTEGER NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    completed_at DATETIME,
    progress_percentage INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (chapter_id) REFERENCES chapters(id) ON DELETE CASCADE,
    UNIQUE(user_id, chapter_id)
);

-- 初期データ: 教材章
INSERT INTO chapters (title, description, order_index) VALUES
('導入', 'tmux+claudeMAXとは何か、なぜ必要なのかを学習', 1),
('環境構築', 'tmux環境のセットアップとclaudeMAXインストール', 2),
('基本操作', 'tmux基本コマンドとclaudeMAX起動方法', 3),
('動作確認', '複数セッション管理の実践', 4),
('応用', '高度な設定とカスタマイズ', 5);

-- インデックス作成
CREATE INDEX idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX idx_user_progress_chapter_id ON user_progress(chapter_id);
CREATE INDEX idx_users_username ON users(username);
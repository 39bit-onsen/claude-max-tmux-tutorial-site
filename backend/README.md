# tmux+claudeMAX教材サイト バックエンド

## 🎯 概要
tmux環境でclaudeMAX（Claude Code）複数起動管理方法の初心者向け教材サイトのバックエンドAPI

## 🚀 セットアップ

### 1. 依存関係のインストール
```bash
cd tutorial-site/backend
npm install
```

### 2. 環境変数設定
```bash
cp .env.example .env
# .envファイルを編集してJWT_SECRETなどを設定
```

### 3. データベース初期化
```bash
npm run init-db
```

### 4. サーバー起動
```bash
# 開発環境
npm run dev

# 本番環境
npm start
```

## 📚 API エンドポイント

### 認証関連
- `POST /api/auth/register` - ユーザー登録
- `POST /api/auth/login` - ログイン
- `GET /api/auth/profile` - プロフィール取得

### 進捗管理
- `GET /api/progress/chapters` - 全章情報取得
- `GET /api/progress/user` - ユーザー進捗取得
- `PUT /api/progress/chapter/:id` - 章進捗更新
- `DELETE /api/progress/reset` - 全進捗リセット
- `DELETE /api/progress/chapter/:id` - 章進捗リセット

### その他
- `GET /api/health` - ヘルスチェック

## 🗄️ データベース設計

### users テーブル
- id (PRIMARY KEY)
- username (UNIQUE)
- email (UNIQUE)
- password_hash
- created_at, updated_at

### chapters テーブル
- id (PRIMARY KEY)
- title
- description
- order_index

### user_progress テーブル
- id (PRIMARY KEY)
- user_id (FK)
- chapter_id (FK)
- completed (BOOLEAN)
- progress_percentage (0-100)
- completed_at
- created_at, updated_at

## 🔒 セキュリティ機能
- bcryptによるパスワードハッシュ化
- JWTトークン認証
- ヘルメットによるセキュリティヘッダー
- CORS設定
- レート制限

## 🛠️ 開発コマンド
```bash
npm run dev      # 開発サーバー起動（nodemon）
npm start        # 本番サーバー起動
npm test         # テスト実行
npm run lint     # ESLint実行
npm run init-db  # データベース初期化
```

## 📁 ディレクトリ構造
```
backend/
├── database/           # データベース関連
│   └── db.js          # SQLite接続・操作
├── routes/            # APIルート
│   ├── auth.js        # 認証API
│   └── progress.js    # 進捗API
├── scripts/           # ユーティリティスクリプト
│   └── init-database.js
├── server.js          # メインサーバーファイル
├── database-schema.sql # データベーススキーマ
├── package.json
├── .env.example
└── README.md
```
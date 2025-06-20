# tmux環境でclaudeMAX管理 教材サイト プロジェクト仕様書

## 🎯 プロジェクト概要
- tmux環境でclaudeMAX（Claude Code）複数起動管理方法の初心者向け教材サイト作成
- 開発パス: ./tutorial-site
- 納期: 2025-06-30 23:59 JST

## 📋 技術仕様
- 日本語UI完全対応（ツールチップ・用語集含む）
- 5章構成（トップ→導入→環境構築→動作確認→応用）
- 簡単ログイン機能（express+sqlite or firebase auth）
- 進捗トラッキング機能付き
- フロント: HTML/CSS(Tailwind)/JS(Vanilla or React)
- バック: Node.js(Express) or Next.js

## 🏗️ ディレクトリ構造
```
tutorial-site/
├── frontend/          # フロントエンド開発 (worker1担当)
├── backend/           # バックエンド開発 (worker2担当)
├── docs/              # ドキュメント (worker3担当)
├── tests/             # テスト (worker3担当)
└── project-spec.md    # この仕様書
```

## 🎪 タスク分割
- **worker1**: フロントエンド開発（UI/UX、進捗バー、教材レイアウト）
- **worker2**: バックエンド開発（認証、進捗管理、データベース）
- **worker3**: ドキュメント・テスト（README、docs/章構成、自動テスト）

## 📅 スケジュール
- 設計・基盤構築: 即日開始
- 開発フェーズ: 3-5日
- テスト・統合: 2-3日
- 最終調整: 1-2日
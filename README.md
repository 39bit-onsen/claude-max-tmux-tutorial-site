# tmux環境でclaudeMAX管理 教材サイト

## 🎯 概要
tmux環境でClaudeMAX（Claude Code）を複数起動し、効率的に管理する方法を学ぶ初心者向け教材サイトです。

## 🚀 クイックスタート

### 前提条件
- Node.js 18.x以上
- tmux 3.x以上
- Claude Code CLI

### インストール
```bash
git clone https://github.com/39bit-onsen/claude-max-tmux-tutorial-site.git
cd claude-max-tmux-tutorial-site
npm install
```

### 開発環境起動

#### フロントエンド
```bash
cd frontend
npm install
npm run dev
```

#### バックエンド
```bash
cd backend
npm install
npm start
```

#### 統合開発
```bash
npm run dev
```

## 📋 プロジェクト構成

```
tutorial-site/
├── frontend/          # フロントエンド (React/HTML+CSS+JS)
│   ├── src/
│   ├── public/
│   └── package.json
├── backend/           # バックエンド (Express/Next.js)
│   ├── src/
│   ├── routes/
│   └── package.json
├── docs/              # ドキュメント
│   ├── chapters/      # 5章構成の教材
│   ├── glossary/      # 用語集
│   └── faq/          # よくある質問
├── tests/             # テストコード
│   ├── frontend/      # フロントエンドテスト
│   ├── backend/       # バックエンドテスト
│   └── integration/   # 統合テスト
└── README.md
```

## 📚 教材構成

### 第1章: 導入編
- tmuxとは？
- Claude Codeとは？
- 基本概念の理解

### 第2章: 環境構築
- tmuxインストール
- Claude Code CLI設定
- 基本設定

### 第3章: 基本操作
- セッション管理
- ウィンドウ操作
- ペイン分割

### 第4章: 実践編
- 複数Claude起動
- エージェント間通信
- プロジェクト管理

### 第5章: 応用編
- 自動化スクリプト
- 効率化Tips
- トラブルシューティング

## 🧪 テスト

### 全テスト実行
```bash
npm test
```

### フロントエンドテスト
```bash
cd frontend
npm test
```

### バックエンドテスト
```bash
cd backend
npm test
```

### 統合テスト
```bash
npm run test:integration
```

## 🔧 主な機能

- 📖 **インタラクティブな教材**: 実際に操作しながら学習
- 📊 **進捗トラッキング**: 学習進度を可視化
- 🔐 **簡単ログイン**: 進捗保存機能
- 📱 **レスポンシブデザイン**: モバイル対応
- 🌐 **日本語完全対応**: UI・用語集・FAQ

## 🚢 デプロイ

### 開発環境
```bash
npm run build:dev
npm run start:dev
```

### 本番環境
```bash
npm run build
npm run start
```

## 📖 ドキュメント

- [プロジェクト仕様書](./project-spec.md)
- [API仕様書](./docs/api-spec.md)
- [デプロイ手順](./docs/deployment.md)
- [用語集](./docs/glossary/)
- [FAQ](./docs/faq/)

## 🤝 貢献

1. フォークする
2. フィーチャーブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add amazing feature'`)
4. ブランチをプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成

## 📝 ライセンス

MIT License - 詳細は [LICENSE](LICENSE) ファイルを参照

## 📞 サポート

- Issue: [GitHub Issues](https://github.com/39bit-onsen/claude-max-tmux-tutorial-site/issues)
- Email: support@example.com
- ドキュメント: [docs/](./docs/)

---

🎯 **納期**: 2025-06-30 23:59 JST  
👥 **開発チーム**: worker1(Frontend), worker2(Backend), worker3(Docs&Tests)

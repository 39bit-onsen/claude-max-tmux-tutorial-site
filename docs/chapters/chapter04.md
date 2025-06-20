# 第4章: 実践編

## 🎯 この章で学ぶこと
- 複数Claudeを使った実際のプロジェクト開発
- エージェント間の効果的な連携手法
- 大規模開発でのワークフロー管理
- パフォーマンス最適化のテクニック

## 🚀 プロジェクト実践: Eコマースサイト開発

### プロジェクト概要
- **名前**: CloudShop
- **技術**: React + Node.js + PostgreSQL + Docker
- **機能**: 商品一覧、カート、決済、管理画面
- **開発期間**: 3週間想定

### 開発体制

```
Boss Claude (統括)
├── Frontend Claude (React専門)
├── Backend Claude (Node.js専門)
├── Database Claude (PostgreSQL専門)
├── DevOps Claude (Docker/CI/CD専門)
└── QA Claude (テスト専門)
```

## 📋 Phase 1: プロジェクト企画・設計

### Boss Claude の役割

```bash
# tmux セッション開始
./scripts/start-multiagent.sh
tmux attach-session -t multiagent

# Boss Claude で企画書作成
claude
> "Eコマースサイト 'CloudShop' の開発を統括します。
> 
> 要件:
> - 商品一覧・詳細表示
> - ショッピングカート機能
> - ユーザー認証・登録
> - 注文管理
> - 管理者画面
> - レスポンシブデザイン
> 
> 各専門エージェントへの指示書と開発スケジュールを作成してください。"
```

### 技術選定会議（エージェント間協議）

#### Architecture Discussion
```bash
# Boss → 全エージェントに技術選定を依頼
./scripts/agent-send.sh frontend "CloudShopフロントエンドの技術選定をお願いします。React, Vue, Angular の中から最適解を提案してください。"

./scripts/agent-send.sh backend "CloudShopバックエンドの技術選定をお願いします。Node.js Express, NestJS, Fastify の中から最適解を提案してください。"

./scripts/agent-send.sh database "CloudShopデータベース設計をお願いします。PostgreSQL, MySQL, MongoDB の中から最適解を提案してください。"
```

#### 提案の統合
```bash
# 各エージェントの提案を収集し、Boss が最終決定
# Frontend: React + TypeScript + Tailwind CSS
# Backend: Node.js + Express + TypeScript
# Database: PostgreSQL + Prisma ORM
# DevOps: Docker + Docker Compose + GitHub Actions
```

## 🏗️ Phase 2: 基盤構築

### Database Claude: スキーマ設計

```sql
-- PostgreSQL スキーマ設計例
./scripts/agent-send.sh database "
以下のスキーマを設計してください：

テーブル構成:
- users (ユーザー管理)
- products (商品管理)
- categories (カテゴリ)
- orders (注文)
- order_items (注文詳細)
- carts (カート)
- reviews (レビュー)

必要なインデックス、外部キー制約、バリデーションも含めてください。
"
```

### Backend Claude: API設計

```bash
./scripts/agent-send.sh backend "
CloudShop REST API を設計・実装してください。

エンドポイント:
- GET /api/products (商品一覧)
- GET /api/products/:id (商品詳細)
- POST /api/auth/login (ログイン)
- POST /api/auth/register (登録)
- GET /api/cart (カート取得)
- POST /api/cart/add (カート追加)
- POST /api/orders (注文作成)
- GET /api/orders (注文履歴)

認証: JWT
バリデーション: Joi
エラーハンドリング: 統一フォーマット
"
```

### Frontend Claude: コンポーネント設計

```bash
./scripts/agent-send.sh frontend "
CloudShop フロントエンドを設計・実装してください。

コンポーネント構成:
- Layout (Header, Footer, Sidebar)
- ProductList (商品一覧)
- ProductCard (商品カード)
- ProductDetail (商品詳細)
- Cart (カート)
- Checkout (決済)
- UserProfile (ユーザープロファイル)
- AdminDashboard (管理画面)

状態管理: Context API + useReducer
ルーティング: React Router
API通信: Axios
スタイリング: Tailwind CSS
"
```

## 🔄 Phase 3: 統合開発

### 並行開発フロー

```bash
# 複数ウィンドウで同時開発
# Window 0: Boss (進捗管理)
# Window 1: Frontend (React開発)
# Window 2: Backend (API開発)
# Window 3: Database (クエリ最適化)
# Window 4: DevOps (Docker環境)
```

### リアルタイム連携例

#### API仕様変更の伝達
```bash
# Backend で API 仕様変更が発生
# Backend Claude → Boss Claude に報告
./scripts/agent-send.sh boss "
商品検索APIの仕様を変更しました。
変更点: フィルタリングパラメータの追加
- category: string[]
- price_range: { min: number, max: number }
- rating: number

Frontend側の実装更新が必要です。
"

# Boss → Frontend に指示
./scripts/agent-send.sh frontend "
商品検索APIの仕様が変更されました。
新しいフィルタリング機能を実装してください。
詳細は Backend Claude に確認してください。
"
```

#### コンポーネント完成の報告
```bash
# Frontend で主要コンポーネント完成
./scripts/agent-send.sh boss "
ProductList コンポーネントが完成しました。
- 商品一覧表示: ✅
- カテゴリフィルタ: ✅
- 価格フィルタ: ✅
- 検索機能: ✅
- ページネーション: ✅

次は ProductDetail コンポーネントの開発に移ります。
Backend API の /api/products/:id が必要です。
"
```

### 統合テスト段階

#### QA Claude の参加
```bash
# 新しいウィンドウでQA Claude起動
tmux new-window -t multiagent -n "qa"
tmux send-keys -t multiagent:qa "cd ~/projects/claude-multiagent" C-m
tmux send-keys -t multiagent:qa "claude" C-m

# QA Claude に指示
./scripts/agent-send.sh qa "
CloudShop の品質保証を担当してください。

テスト対象:
- フロントエンド: React コンポーネント
- バックエンド: API エンドポイント
- 統合: フロント・バック連携
- E2E: ユーザーシナリオ

テストフレームワーク:
- Jest (単体テスト)
- React Testing Library (コンポーネントテスト)
- Supertest (API テスト)
- Cypress (E2E テスト)
"
```

## 🧪 Phase 4: 高度な連携テクニック

### 自動化されたエージェント間通信

```bash
# 自動進捗レポートスクリプト
cat > scripts/progress-report.sh << 'EOF'
#!/bin/bash

echo "=== CloudShop 開発進捗レポート ==="
echo "日時: $(date)"
echo

# 各エージェントから進捗を取得
./scripts/agent-send.sh frontend "現在の進捗状況を1行で報告してください"
sleep 2
./scripts/agent-send.sh backend "現在の進捗状況を1行で報告してください"
sleep 2
./scripts/agent-send.sh database "現在の進捗状況を1行で報告してください"
sleep 2
./scripts/agent-send.sh devops "現在の進捗状況を1行で報告してください"

echo "================================"
EOF

chmod +x scripts/progress-report.sh
```

### コード品質管理

```bash
# 品質チェック自動化
cat > scripts/quality-check.sh << 'EOF'
#!/bin/bash

echo "コード品質チェック開始..."

# Frontend 品質チェック
./scripts/agent-send.sh frontend "ESLint + Prettier でコード品質をチェックし、問題があれば修正してください"

# Backend 品質チェック  
./scripts/agent-send.sh backend "ESLint + TypeScript strict mode でコード品質をチェックし、問題があれば修正してください"

# セキュリティチェック
./scripts/agent-send.sh qa "npm audit でセキュリティ脆弱性をチェックし、報告してください"

echo "品質チェック完了"
EOF

chmod +x scripts/quality-check.sh
```

### デプロイ自動化

```bash
# DevOps Claude でCI/CD設定
./scripts/agent-send.sh devops "
本番デプロイの自動化を設定してください。

要件:
- GitHub Actions でCI/CD
- Docker イメージビルド
- AWS ECS または Vercel へのデプロイ
- 自動テスト実行
- 失敗時のロールバック
- Slack 通知

設定ファイル:
- .github/workflows/deploy.yml
- Dockerfile
- docker-compose.prod.yml
"
```

## 📊 Phase 5: 監視と最適化

### パフォーマンス監視

```bash
# パフォーマンス最適化タスク
./scripts/agent-send.sh frontend "
フロントエンドのパフォーマンス最適化をお願いします。

チェック項目:
- バンドルサイズ (webpack-bundle-analyzer)
- コンポーネントレンダリング (React DevTools)
- 画像最適化 (WebP対応)
- 遅延読み込み (React.lazy)
- メモ化 (React.memo, useMemo)
"

./scripts/agent-send.sh backend "
バックエンドのパフォーマンス最適化をお願いします。

チェック項目:
- データベースクエリ最適化
- レスポンス時間測定
- メモリ使用量監視
- レート制限実装
- キャッシュ戦略 (Redis)
"
```

### 運用監視システム

```bash
./scripts/agent-send.sh devops "
本番環境の監視システムを構築してください。

監視項目:
- サーバーリソース (CPU, メモリ, ディスク)
- アプリケーションメトリクス
- エラーログ収集
- レスポンス時間
- ユーザー行動分析

ツール:
- Prometheus + Grafana
- ELK Stack (Elasticsearch, Logstash, Kibana)
- Sentry (エラートラッキング)
- Google Analytics
"
```

## 🎯 開発完了・リリース

### 最終チェックリスト

```bash
# Boss Claude で最終確認
./scripts/agent-send.sh boss "
CloudShop リリース前の最終チェックを実行してください。

確認項目:
□ 機能テスト完了
□ セキュリティ監査完了
□ パフォーマンステスト合格
□ ドキュメント整備完了
□ デプロイ手順確認
□ 監視システム稼働
□ バックアップ体制確立

問題があれば該当エージェントに修正指示を出してください。
"
```

## 📚 次章への準備

実践編で学んだ複数Claude連携を、次章でさらに効率化していきます。

### 習得確認
- [ ] 大規模プロジェクトでの役割分担ができる
- [ ] エージェント間の効果的な連携ができる
- [ ] 並行開発のワークフローが理解できた
- [ ] 品質管理・監視の重要性を理解した

## 🔗 関連リンク

- [プロジェクト管理テンプレート](../templates/project-management.md)
- [エージェント間通信プロトコル](../faq/communication-protocol.md)
- [大規模開発のベストプラクティス](../faq/best-practices.md)

---

**前章**: [第3章: 基本操作](./chapter03.md)  
**次章**: [第5章: 応用編](./chapter05.md)  
**進捗**: 4/5章完了 (80%)
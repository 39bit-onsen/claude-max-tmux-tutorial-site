# 第3章: 基本操作

## 🎯 この章で学ぶこと
- tmuxの基本操作（セッション・ウィンドウ・ペイン）
- Claude Code CLIの基本コマンド
- エージェント間通信の基礎
- 実践的な操作フロー

## 🎪 tmux基本操作

### セッション管理

```bash
# セッション一覧表示
tmux list-sessions  # または tmux ls

# セッション作成
tmux new-session -s session_name

# セッションにアタッチ
tmux attach-session -t session_name  # または tmux a -t session_name

# セッションをデタッチ (セッション内で)
Ctrl+a d  # プレフィックスキー + d

# セッション削除
tmux kill-session -t session_name
```

### ウィンドウ操作

```bash
# ウィンドウ作成 (セッション内で)
Ctrl+a c

# ウィンドウ切り替え
Ctrl+a 0-9     # 番号指定
Ctrl+a n       # 次のウィンドウ
Ctrl+a p       # 前のウィンドウ
Ctrl+a l       # 最後のウィンドウ

# ウィンドウ名変更
Ctrl+a ,

# ウィンドウ削除
Ctrl+a &
```

### ペイン操作

```bash
# ペイン分割
Ctrl+a |       # 縦分割
Ctrl+a -       # 横分割

# ペイン移動
Ctrl+a 矢印キー  # 方向キーで移動
Ctrl+a o       # 次のペイン

# ペインサイズ調整
Ctrl+a Alt+矢印キー

# ペイン削除
Ctrl+a x
```

## 🤖 Claude Code基本操作

### 単発コマンド

```bash
# 基本的な質問
claude "Pythonでフィボナッチ数列を計算する関数を作って"

# ファイル指定
claude --file app.py "このファイルにコメントを追加して"

# プロジェクト全体を対象
claude --project . "TypeScriptプロジェクトをNext.jsに移行する手順を教えて"
```

### インタラクティブモード

```bash
# 対話モードで起動
claude

# 継続的な会話
> "React componentを作成したい"
> "状態管理にはuseStateを使って"
> "スタイリングはTailwind CSSで"
```

### 設定とカスタマイズ

```bash
# 設定確認
claude config list

# モデル変更
claude config set model claude-3-sonnet

# 出力形式設定
claude config set format markdown
```

## 🔄 実践: マルチエージェント起動

### Step 1: セッション起動

```bash
# プロジェクトディレクトリに移動
cd ~/projects/claude-multiagent

# マルチエージェントセッション起動
./scripts/start-multiagent.sh

# セッションにアタッチ
tmux attach-session -t multiagent
```

### Step 2: 各エージェントの初期化

#### Boss エージェント (ウィンドウ0)
```bash
# Bossウィンドウで実行
claude
> "あなたはプロジェクト統括のBoss Claudeです。
> フロントエンド、バックエンド、DevOpsの各エージェントを管理し、
> タスクの調整と進捗管理を行ってください。"
```

#### Frontend エージェント (ウィンドウ1)
```bash
# Ctrl+a 1 でFrontendウィンドウに移動
claude
> "あなたはフロントエンド専門のClaude Codeです。
> React、Vue.js、HTML/CSS、JavaScript、UI/UXデザインに特化し、
> フロントエンド開発全般を担当してください。"
```

#### Backend エージェント (ウィンドウ2)
```bash
# Ctrl+a 2 でBackendウィンドウに移動
claude
> "あなたはバックエンド専門のClaude Codeです。
> Node.js、Express、データベース、API設計、サーバー管理に特化し、
> バックエンド開発全般を担当してください。"
```

#### DevOps エージェント (ウィンドウ3)
```bash
# Ctrl+a 3 でDevOpsウィンドウに移動
claude
> "あなたはDevOps専門のClaude Codeです。
> Docker、CI/CD、テスト自動化、監視、デプロイメントに特化し、
> 運用・保守全般を担当してください。"
```

## 📡 エージェント間通信

### 通信スクリプトの使用

```bash
# Boss → Frontend に指示
./scripts/agent-send.sh frontend "React Todoアプリのコンポーネント設計をお願いします"

# Boss → Backend に指示
./scripts/agent-send.sh backend "Todo管理のREST APIを設計してください"

# Boss → DevOps に指示
./scripts/agent-send.sh devops "Docker開発環境をセットアップしてください"
```

### 手動通信（コピー&ペースト）

```bash
# 1. 送信側のウィンドウで出力をコピー
# 2. 受信側のウィンドウに移動
# 3. メッセージを貼り付けて送信
```

## 🎯 実践例: Todoアプリ開発

### Step 1: Boss が全体計画を作成

```
Boss Claude> "Todoアプリを開発します。以下の要件で各エージェントに指示を出してください：

要件:
- シンプルなTodo管理
- React フロントエンド
- Node.js/Express バックエンド
- SQLite データベース
- Docker 開発環境

各エージェントの役割分担を明確にして、開発計画を立ててください。"
```

### Step 2: 各エージェントに専門タスクを割り当て

#### Frontend への指示
```bash
./scripts/agent-send.sh frontend "
Todoアプリのフロントエンド開発をお願いします。
- React + TypeScript
- コンポーネント: TodoList, TodoItem, AddTodo
- 状態管理: useState/useEffect
- API通信: fetch
- CSS: Tailwind CSS
"
```

#### Backend への指示
```bash
./scripts/agent-send.sh backend "
TodoアプリのバックエンドAPIを開発してください。
- Node.js + Express + TypeScript
- SQLite データベース
- REST API: GET/POST/PUT/DELETE /api/todos
- CORS設定
- エラーハンドリング
"
```

#### DevOps への指示
```bash
./scripts/agent-send.sh devops "
開発環境をセットアップしてください。
- Dockerコンテナ構成
- docker-compose.yml
- フロント・バックエンドの統合環境
- 開発用の自動リロード設定
"
```

### Step 3: 進捗確認とデバッグ

```bash
# 各ウィンドウを巡回して進捗確認
Ctrl+a 1  # Frontend確認
Ctrl+a 2  # Backend確認  
Ctrl+a 3  # DevOps確認
Ctrl+a 0  # Boss に戻る

# 問題があれば具体的な指示を送信
./scripts/agent-send.sh frontend "APIレスポンスの型定義を追加してください"
```

## 🔧 効率的な操作のコツ

### ウィンドウ間の素早い移動

```bash
# ~/.tmux.conf に追加
bind-key -n M-1 select-window -t 0  # Alt+1 でBoss
bind-key -n M-2 select-window -t 1  # Alt+2 でFrontend
bind-key -n M-3 select-window -t 2  # Alt+3 でBackend
bind-key -n M-4 select-window -t 3  # Alt+4 でDevOps
```

### ログ保存設定

```bash
# tmux session全体のログを保存
tmux pipe-pane -t multiagent -o 'cat >> ~/projects/claude-multiagent/logs/session.log'
```

### 一括操作

```bash
# 全ウィンドウに同じコマンドを送信
tmux send-keys -t multiagent:boss "echo 'プロジェクト開始'" C-m
tmux send-keys -t multiagent:frontend "echo 'フロントエンド開始'" C-m
tmux send-keys -t multiagent:backend "echo 'バックエンド開始'" C-m
tmux send-keys -t multiagent:devops "echo 'DevOps開始'" C-m
```

## 📚 次章への準備

基本操作を習得したら、次章でより高度な実践例を学習します。

### 習得確認
- [ ] tmuxの基本操作ができる
- [ ] Claude Codeの対話モードを使える
- [ ] エージェント間通信ができる
- [ ] 実際のプロジェクトで各エージェントを活用できる

## 🔗 関連リンク

- [tmuxキーバインド一覧](../faq/tmux-keybindings.md)
- [Claude Codeコマンドリファレンス](../faq/claude-commands.md)
- [エージェント間通信Tips](../faq/agent-communication.md)

---

**前章**: [第2章: 環境構築](./chapter02.md)  
**次章**: [第4章: 実践編](./chapter04.md)  
**進捗**: 3/5章完了 (60%)
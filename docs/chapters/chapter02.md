# 第2章: 環境構築

## 🎯 この章で学ぶこと
- tmuxのインストール・設定
- Claude Code CLIのセットアップ
- プロジェクト用ディレクトリ構成
- 基本設定ファイルの作成

## 📦 必要なツールのインストール

### tmux インストール

#### macOS (Homebrew)
```bash
brew install tmux
```

#### Ubuntu/Debian
```bash
sudo apt update
sudo apt install tmux
```

#### CentOS/RHEL
```bash
sudo yum install tmux
# または
sudo dnf install tmux
```

#### Windows (WSL推奨)
```bash
# WSL2 Ubuntu環境で
sudo apt update
sudo apt install tmux
```

### Claude Code CLI インストール

```bash
# npmでインストール
npm install -g @anthropic-ai/claude-code

# または直接ダウンロード
curl -fsSL https://install.anthropic.com/claude-code | sh
```

## 🔧 基本設定

### tmux設定ファイル作成

```bash
# ~/.tmux.confファイルを作成
cat > ~/.tmux.conf << 'EOF'
# プレフィックスキーを変更 (Ctrl+a)
set -g prefix C-a
unbind C-b
bind C-a send-prefix

# マウス操作を有効化
set -g mouse on

# ウィンドウ番号を1から開始
set -g base-index 1
setw -g pane-base-index 1

# ウィンドウ名を自動更新
setw -g automatic-rename on
set -g renumber-windows on

# 履歴を増やす
set -g history-limit 10000

# 256色対応
set -g default-terminal "screen-256color"

# ステータスバーの設定
set -g status-bg colour235
set -g status-fg colour136
set -g status-left '[#S] '
set -g status-right '#[fg=colour233,bg=colour245] %Y-%m-%d %H:%M '

# ペイン区切り線の色
set -g pane-border-style fg=colour238
set -g pane-active-border-style fg=colour208

# キーバインド追加
bind | split-window -h
bind - split-window -v
bind r source-file ~/.tmux.conf \; display "Config reloaded!"
EOF
```

### Claude Code認証設定

```bash
# APIキーの設定
export ANTHROPIC_API_KEY="your_api_key_here"

# 設定ファイルに追加
echo 'export ANTHROPIC_API_KEY="your_api_key_here"' >> ~/.bashrc
source ~/.bashrc

# Claude Codeの動作確認
claude --version
```

## 📁 プロジェクト構成

### ディレクトリ構造作成

```bash
# プロジェクトルート作成
mkdir -p ~/projects/claude-multiagent
cd ~/projects/claude-multiagent

# 基本ディレクトリ構成
mkdir -p {scripts,configs,logs,tmp}
mkdir -p projects/{frontend,backend,docs,tests}

# 構成確認
tree -a
```

### 期待される構成
```
claude-multiagent/
├── scripts/           # 自動化スクリプト
│   ├── start-multiagent.sh
│   ├── stop-multiagent.sh
│   └── agent-send.sh
├── configs/          # 設定ファイル
│   ├── tmux.conf
│   └── claude-config.json
├── logs/             # ログファイル
├── tmp/              # 一時ファイル
└── projects/         # 実際のプロジェクト
    ├── frontend/
    ├── backend/
    ├── docs/
    └── tests/
```

## 🚀 起動スクリプト作成

### メインスクリプト

```bash
cat > scripts/start-multiagent.sh << 'EOF'
#!/bin/bash

# tmuxセッション名
SESSION_NAME="multiagent"

# セッションが既に存在する場合は終了
tmux has-session -t $SESSION_NAME 2>/dev/null
if [ $? == 0 ]; then
    echo "セッション '$SESSION_NAME' は既に存在します"
    echo "終了する場合: ./scripts/stop-multiagent.sh"
    exit 1
fi

# セッション作成
tmux new-session -d -s $SESSION_NAME -n "boss"

# ウィンドウ作成
tmux new-window -t $SESSION_NAME -n "frontend"
tmux new-window -t $SESSION_NAME -n "backend"
tmux new-window -t $SESSION_NAME -n "devops"

# 各ウィンドウでClaude Code起動
tmux send-keys -t $SESSION_NAME:boss "cd ~/projects/claude-multiagent" C-m
tmux send-keys -t $SESSION_NAME:boss "echo 'Boss Claude起動中...'" C-m

tmux send-keys -t $SESSION_NAME:frontend "cd ~/projects/claude-multiagent/projects/frontend" C-m
tmux send-keys -t $SESSION_NAME:frontend "echo 'Frontend Claude起動中...'" C-m

tmux send-keys -t $SESSION_NAME:backend "cd ~/projects/claude-multiagent/projects/backend" C-m
tmux send-keys -t $SESSION_NAME:backend "echo 'Backend Claude起動中...'" C-m

tmux send-keys -t $SESSION_NAME:devops "cd ~/projects/claude-multiagent/projects/tests" C-m
tmux send-keys -t $SESSION_NAME:devops "echo 'DevOps Claude起動中...'" C-m

# bossウィンドウをアクティブに
tmux select-window -t $SESSION_NAME:boss

echo "tmuxセッション '$SESSION_NAME' を起動しました"
echo "接続: tmux attach-session -t $SESSION_NAME"
echo "終了: ./scripts/stop-multiagent.sh"
EOF

chmod +x scripts/start-multiagent.sh
```

### 終了スクリプト

```bash
cat > scripts/stop-multiagent.sh << 'EOF'
#!/bin/bash

SESSION_NAME="multiagent"

tmux has-session -t $SESSION_NAME 2>/dev/null
if [ $? != 0 ]; then
    echo "セッション '$SESSION_NAME' は存在しません"
    exit 1
fi

tmux kill-session -t $SESSION_NAME
echo "セッション '$SESSION_NAME' を終了しました"
EOF

chmod +x scripts/stop-multiagent.sh
```

### エージェント間通信スクリプト

```bash
cat > scripts/agent-send.sh << 'EOF'
#!/bin/bash

if [ $# -ne 2 ]; then
    echo "使用方法: $0 <送信先> <メッセージ>"
    echo "例: $0 frontend 'Hello from boss'"
    exit 1
fi

TARGET=$1
MESSAGE=$2
SESSION_NAME="multiagent"

# 送信先の検証
case $TARGET in
    boss|frontend|backend|devops)
        echo "📤 送信中: $TARGET ← '$MESSAGE'"
        tmux send-keys -t $SESSION_NAME:$TARGET "$MESSAGE" C-m
        echo "✅ 送信完了"
        ;;
    *)
        echo "❌ 無効な送信先: $TARGET"
        echo "有効な送信先: boss, frontend, backend, devops"
        exit 1
        ;;
esac
EOF

chmod +x scripts/agent-send.sh
```

## ✅ 動作確認

### 基本動作テスト

```bash
# 1. tmux動作確認
tmux new-session -d -s test-session
tmux list-sessions
tmux kill-session -t test-session

# 2. Claude Code動作確認
claude "Hello World"

# 3. スクリプト動作確認
./scripts/start-multiagent.sh
tmux list-sessions
./scripts/stop-multiagent.sh
```

### エラーが発生した場合

```bash
# tmuxのバージョン確認
tmux -V

# Claude Codeの設定確認
claude --help

# パス設定確認
echo $PATH
which claude
```

## 📚 次章への準備

環境構築が完了したら、次章で実際の基本操作を学習します。

### 確認事項
- [ ] tmuxがインストールされている
- [ ] Claude Code CLIが動作する
- [ ] 起動スクリプトが正常に動作する
- [ ] プロジェクト構成が作成されている

## 🔧 トラブルシューティング

### よくある問題

1. **tmuxが起動しない**
   ```bash
   # 端末の互換性確認
   echo $TERM
   export TERM=xterm-256color
   ```

2. **Claude Codeが認証エラー**
   ```bash
   # APIキー再設定
   claude auth login
   ```

3. **スクリプトが実行できない**
   ```bash
   # 実行権限付与
   chmod +x scripts/*.sh
   ```

## 🔗 関連リンク

- [tmux設定ガイド](../faq/tmux-config.md)
- [Claude Code認証](../faq/claude-auth.md)
- [トラブルシューティング](../faq/troubleshooting.md)

---

**前章**: [第1章: 導入編](./chapter01.md)  
**次章**: [第3章: 基本操作](./chapter03.md)  
**進捗**: 2/5章完了 (40%)
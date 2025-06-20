# よくある質問（FAQ）

## 🚀 セットアップ・インストール

### Q: tmuxのインストールで失敗します
**A:** OS別のインストール方法を確認してください。

```bash
# Ubuntu/Debian
sudo apt update && sudo apt install tmux

# macOS
brew install tmux

# CentOS/RHEL
sudo yum install tmux
```

権限エラーが発生する場合は、`sudo`を使用してください。

### Q: Claude Code CLIが認識されません
**A:** インストール確認と環境変数設定を行ってください。

```bash
# インストール確認
which claude
claude --version

# 環境変数設定
export ANTHROPIC_API_KEY="your_api_key_here"
echo 'export ANTHROPIC_API_KEY="your_api_key_here"' >> ~/.bashrc
source ~/.bashrc
```

### Q: APIキーはどこから取得できますか？
**A:** Anthropic社の公式サイトから取得できます。

1. [Anthropic Console](https://console.anthropic.com/)にアクセス
2. アカウント作成・ログイン
3. API Keysセクションで新しいキーを生成
4. 生成されたキーを環境変数に設定

## 🎪 tmux操作

### Q: tmuxのプレフィックスキーを変更したい
**A:** `~/.tmux.conf`で設定変更できます。

```bash
# Ctrl+a に変更
set -g prefix C-a
unbind C-b
bind C-a send-prefix
```

### Q: セッションが勝手に終了してしまいます
**A:** 以下の設定を確認してください。

```bash
# セッション保持設定
set -g remain-on-exit on
set -g detach-on-destroy off

# セッション一覧確認
tmux list-sessions
```

### Q: ペイン分割ができません
**A:** キーバインドを確認してください。

```bash
# デフォルト設定
# 縦分割: Ctrl+b %
# 横分割: Ctrl+b "

# カスタム設定（推奨）
bind | split-window -h
bind - split-window -v
```

### Q: 日本語が文字化けします
**A:** 文字エンコーディング設定を確認してください。

```bash
# 環境変数設定
export LANG=ja_JP.UTF-8
export LC_ALL=ja_JP.UTF-8

# tmux設定
set -g default-terminal "screen-256color"
```

## 🤖 Claude Code操作

### Q: Claude Codeの応答が遅いです
**A:** 以下の要因を確認してください。

1. **ネットワーク接続**: インターネット接続を確認
2. **API制限**: レート制限に達していないか確認
3. **リクエストサイズ**: 大きなファイルを処理している場合は分割

```bash
# 接続テスト
claude "Hello"

# API制限確認
claude --debug "test"
```

### Q: Claude Codeがエラーを返します
**A:** エラーメッセージを確認してください。

```bash
# デバッグモード
claude --debug "your question"

# ログ確認
tail -f ~/.claude/logs/claude-code.log
```

よくあるエラー：
- `401 Unauthorized`: APIキーが無効
- `429 Too Many Requests`: レート制限
- `500 Internal Server Error`: サーバー側問題

### Q: 複数のClaude Codeを同時実行できますか？
**A:** はい、tmuxの各ウィンドウで個別に実行できます。

```bash
# 複数セッション起動
tmux new-session -d -s agent1
tmux new-session -d -s agent2
tmux new-session -d -s agent3

# 各セッションでClaude起動
tmux send-keys -t agent1 "claude" C-m
tmux send-keys -t agent2 "claude" C-m
tmux send-keys -t agent3 "claude" C-m
```

## 📡 エージェント間通信

### Q: エージェント間でメッセージを送信できません
**A:** スクリプトの実行権限と設定を確認してください。

```bash
# スクリプト権限確認
chmod +x scripts/agent-send.sh

# 送信テスト
./scripts/agent-send.sh frontend "test message"

# tmuxセッション確認
tmux list-sessions
tmux list-windows -t multiagent
```

### Q: 送信したメッセージが表示されません
**A:** 以下を確認してください。

1. **セッション名**: 正しいセッション名を使用
2. **ウィンドウ名**: 送信先ウィンドウが存在するか確認
3. **アクティブ状態**: 受信側のClaude Codeが起動中か確認

```bash
# セッション詳細確認
tmux list-sessions -F "#{session_name}: #{session_windows} windows"

# ウィンドウ詳細確認
tmux list-windows -t multiagent -F "#{window_index}: #{window_name} (#{window_active})"
```

## 🔧 トラブルシューティング

### Q: 「command not found」エラーが発生します
**A:** PATH設定を確認してください。

```bash
# PATH確認
echo $PATH

# tmux PATH確認
which tmux

# Claude Code PATH確認
which claude
```

### Q: セッションが見つからないエラー
**A:** セッション名を確認してください。

```bash
# セッション一覧
tmux list-sessions

# セッション作成
tmux new-session -d -s multiagent

# セッション削除
tmux kill-session -t multiagent
```

### Q: 高CPU使用率でシステムが重くなります
**A:** リソース使用量を最適化してください。

```bash
# プロセス確認
top -p $(pgrep -f claude)

# tmuxプロセス確認
tmux list-sessions -F "#{session_name}: #{session_activity}"

# 不要なセッション削除
tmux kill-session -t unnecessary_session
```

### Q: メモリ不足エラーが発生します
**A:** メモリ使用量を確認し、必要に応じて調整してください。

```bash
# メモリ使用量確認
free -h

# tmuxメモリ使用量確認
ps aux | grep tmux

# Claude Codeメモリ使用量確認
ps aux | grep claude
```

## 💡 パフォーマンス最適化

### Q: レスポンス時間を改善したい
**A:** 以下の最適化を試してください。

1. **プロンプト最適化**: 明確で簡潔な指示
2. **コンテキスト管理**: 不要な履歴のクリア
3. **並列処理**: 複数エージェントでの分散処理

```bash
# 新しいClaude Codeセッション
claude --new-session

# 履歴クリア
claude --clear-history
```

### Q: 大量のログでディスクが圧迫されます
**A:** ログローテーション設定を行ってください。

```bash
# ログファイル確認
ls -lh logs/

# ログローテーション設定
cat > /etc/logrotate.d/claude-multiagent << EOF
/home/user/projects/claude-multiagent/logs/*.log {
    daily
    rotate 7
    compress
    delaycompress
    missingok
    notifempty
}
EOF
```

## 🔐 セキュリティ

### Q: APIキーの安全な管理方法は？
**A:** 以下の方法を推奨します。

```bash
# 環境変数ファイル（.envファイル）
echo "ANTHROPIC_API_KEY=your_key_here" > .env
echo ".env" >> .gitignore

# 権限設定
chmod 600 .env

# 読み込み
source .env
```

### Q: 他のユーザーからセッションを守りたい
**A:** tmuxセッションの権限を設定してください。

```bash
# セッション権限設定
tmux new-session -d -s private-session
tmux set-option -t private-session -g default-terminal "screen-256color"

# ソケットファイル権限
chmod 700 /tmp/tmux-$(id -u)/
```

## 📚 学習・カスタマイズ

### Q: 初心者向けの学習手順は？
**A:** 以下の順序で学習することを推奨します。

1. [第1章: 導入編](../chapters/chapter01.md)
2. [第2章: 環境構築](../chapters/chapter02.md)
3. [第3章: 基本操作](../chapters/chapter03.md)
4. 実際のプロジェクトで練習
5. [第4章: 実践編](../chapters/chapter04.md)
6. [第5章: 応用編](../chapters/chapter05.md)

### Q: カスタムスクリプトを作成したい
**A:** 既存のスクリプトを参考にしてください。

```bash
# テンプレートスクリプト
cat > scripts/my-custom-script.sh << 'EOF'
#!/bin/bash

# 設定
SESSION_NAME="my-session"
AGENT_NAME="my-agent"

# 機能実装
my_function() {
    echo "カスタム機能実行"
    ./scripts/agent-send.sh $AGENT_NAME "$1"
}

# 実行
my_function "Hello from custom script"
EOF

chmod +x scripts/my-custom-script.sh
```

## 🆘 サポート・コミュニティ

### Q: バグを見つけました
**A:** 以下の方法で報告してください。

1. **GitHub Issues**: [リポジトリ](https://github.com/your-repo/claude-code-communication/issues)
2. **詳細情報**: OS、tmuxバージョン、エラーメッセージ
3. **再現手順**: 問題を再現する具体的な手順

### Q: 機能追加の要望があります
**A:** GitHub Discussionsで提案してください。

1. **機能の詳細**: 具体的な機能説明
2. **使用例**: どのような場面で使用するか
3. **代替案**: 現在の回避方法があれば記載

### Q: コミュニティに参加したい
**A:** 以下の方法で参加できます。

- **Discord**: [コミュニティサーバー](https://discord.gg/your-server)
- **GitHub Discussions**: [議論フォーラム](https://github.com/your-repo/claude-code-communication/discussions)
- **月例勉強会**: オンライン勉強会に参加

---

## 🔗 関連リンク

- [用語集](../glossary/README.md)
- [トラブルシューティング](./troubleshooting.md)
- [プロジェクト仕様書](../../project-spec.md)
- [GitHub Issues](https://github.com/your-repo/claude-code-communication/issues)
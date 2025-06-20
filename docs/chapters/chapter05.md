# 第5章: 応用編

## 🎯 この章で学ぶこと
- 高度な自動化スクリプト作成
- AI エージェント間の協調アルゴリズム
- 大規模チーム開発での効率化技法
- カスタマイズとエクステンション開発

## 🚀 Advanced Automation Framework

### インテリジェント・タスク・オーケストレーター

```bash
# 高度な自動化フレームワークの構築
cat > scripts/intelligent-orchestrator.sh << 'EOF'
#!/bin/bash

# 設定ファイル読み込み
source configs/orchestrator.conf

# ログ機能
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a logs/orchestrator.log
}

# エージェント状態監視
monitor_agents() {
    for agent in boss frontend backend database devops qa; do
        if tmux has-session -t multiagent 2>/dev/null; then
            if tmux list-windows -t multiagent | grep -q $agent; then
                log "✅ $agent: アクティブ"
            else
                log "❌ $agent: 非アクティブ"
                # 自動復旧
                restart_agent $agent
            fi
        fi
    done
}

# 動的負荷分散
distribute_tasks() {
    local task_queue=$1
    local available_agents=()
    
    # 利用可能なエージェント検出
    for agent in frontend backend database devops; do
        if check_agent_load $agent; then
            available_agents+=($agent)
        fi
    done
    
    # タスク配布アルゴリズム
    distribute_by_expertise "$task_queue" "${available_agents[@]}"
}

# 自動品質保証
auto_qa_pipeline() {
    log "自動品質保証パイプライン開始"
    
    # 1. 静的解析
    ./scripts/agent-send.sh qa "静的解析を実行してください: ESLint, TSC, SonarQube"
    
    # 2. 単体テスト
    ./scripts/agent-send.sh qa "全単体テストを実行してください"
    
    # 3. 統合テスト
    ./scripts/agent-send.sh qa "API統合テストを実行してください"
    
    # 4. E2Eテスト
    ./scripts/agent-send.sh qa "E2Eテストを実行してください"
    
    # 5. レポート生成
    generate_qa_report
}

# インテリジェント・エラー・ハンドリング
handle_error() {
    local error_source=$1
    local error_message=$2
    
    log "エラー検出: $error_source - $error_message"
    
    # エラー分類
    case $error_source in
        "frontend")
            ./scripts/agent-send.sh frontend "エラー解析と修正: $error_message"
            ./scripts/agent-send.sh qa "フロントエンドエラーの回帰テスト実行"
            ;;
        "backend")
            ./scripts/agent-send.sh backend "API エラー解析と修正: $error_message"
            ./scripts/agent-send.sh database "関連データベースクエリ確認"
            ;;
        "database")
            ./scripts/agent-send.sh database "データベースエラー解析: $error_message"
            ./scripts/agent-send.sh devops "データベース監視強化"
            ;;
    esac
}

# メイン実行
main() {
    log "インテリジェント・オーケストレーター開始"
    
    while true; do
        monitor_agents
        check_task_queue
        auto_optimization
        sleep 30
    done
}

# 実行
main "$@"
EOF

chmod +x scripts/intelligent-orchestrator.sh
```

### AI-Powered Code Review System

```bash
# AI コードレビューシステム
cat > scripts/ai-code-review.sh << 'EOF'
#!/bin/bash

# Git hooks と連携したAIコードレビュー
setup_git_hooks() {
    cat > .git/hooks/pre-commit << 'HOOK'
#!/bin/bash

echo "AI コードレビュー開始..."

# 変更されたファイルを取得
CHANGED_FILES=$(git diff --cached --name-only --diff-filter=ACM)

for file in $CHANGED_FILES; do
    if [[ $file == *.js || $file == *.ts || $file == *.jsx || $file == *.tsx ]]; then
        # Frontend専門Claudeでレビュー
        ../scripts/agent-send.sh frontend "コードレビュー: $file の変更内容を確認し、改善提案をしてください"
    elif [[ $file == *.py || $file == *.java || $file == *.go ]]; then
        # Backend専門Claudeでレビュー
        ../scripts/agent-send.sh backend "コードレビュー: $file の変更内容を確認し、改善提案をしてください"
    fi
done

# セキュリティチェック
../scripts/agent-send.sh qa "セキュリティスキャン: 変更されたコードのセキュリティリスクを評価してください"

echo "AI コードレビュー完了"
HOOK

    chmod +x .git/hooks/pre-commit
}

# 継続的品質改善
continuous_quality_improvement() {
    # 品質メトリクス収集
    ./scripts/agent-send.sh qa "品質メトリクス収集: 
    - コードカバレッジ
    - 循環的複雑度
    - 技術的負債
    - パフォーマンス指標"
    
    # 改善提案生成
    ./scripts/agent-send.sh boss "品質メトリクスに基づいた改善計画を作成してください"
}

setup_git_hooks
continuous_quality_improvement
EOF

chmod +x scripts/ai-code-review.sh
```

## 🧠 Multi-Agent Collaboration Patterns

### Consensus Decision Making

```bash
# エージェント間の合意形成システム
cat > scripts/consensus-maker.sh << 'EOF'
#!/bin/bash

# 技術選定における合意形成
technical_decision_consensus() {
    local decision_topic=$1
    
    echo "=== 技術選定合意形成: $decision_topic ==="
    
    # 各エージェントから意見収集
    ./scripts/agent-send.sh frontend "技術選定: $decision_topic について、フロントエンド観点からの推奨案を提示してください"
    ./scripts/agent-send.sh backend "技術選定: $decision_topic について、バックエンド観点からの推奨案を提示してください"
    ./scripts/agent-send.sh devops "技術選定: $decision_topic について、運用・保守観点からの推奨案を提示してください"
    ./scripts/agent-send.sh qa "技術選定: $decision_topic について、品質・テスト観点からの推奨案を提示してください"
    
    # 30秒待機（回答時間）
    sleep 30
    
    # Boss が合意形成
    ./scripts/agent-send.sh boss "各エージェントの技術選定意見を統合し、最終決定を行ってください。
    決定理由も含めて、全エージェントに通知してください。"
}

# アーキテクチャ設計における協調
collaborative_architecture_design() {
    echo "=== 協調アーキテクチャ設計セッション開始 ==="
    
    # フェーズ1: 要件共有
    ./scripts/agent-send.sh boss "アーキテクチャ設計セッション開始。要件を全エージェントに共有してください"
    
    # フェーズ2: 各層の設計
    ./scripts/agent-send.sh frontend "フロントエンド層の設計案を作成してください"
    ./scripts/agent-send.sh backend "バックエンド層の設計案を作成してください"
    ./scripts/agent-send.sh database "データ層の設計案を作成してください"
    
    # フェーズ3: 統合設計
    sleep 60  # 設計時間確保
    ./scripts/agent-send.sh boss "各層の設計案を統合し、全体アーキテクチャを確定してください"
}

# 使用例
technical_decision_consensus "フロントエンドフレームワーク選定 (React vs Vue vs Angular)"
collaborative_architecture_design
EOF

chmod +x scripts/consensus-maker.sh
```

### Adaptive Workflow Management

```bash
# 適応的ワークフロー管理
cat > scripts/adaptive-workflow.sh << 'EOF'
#!/bin/bash

# プロジェクトフェーズに応じたエージェント構成の動的変更
adapt_to_project_phase() {
    local current_phase=$1
    
    case $current_phase in
        "planning")
            echo "企画フェーズ: アーキテクト中心構成"
            configure_agents "boss:primary" "frontend:advisory" "backend:advisory" "database:advisory"
            ;;
        "development")
            echo "開発フェーズ: 全エージェント並行構成"
            configure_agents "boss:coordinator" "frontend:active" "backend:active" "database:active" "devops:support"
            ;;
        "testing")
            echo "テストフェーズ: QA中心構成"
            configure_agents "qa:primary" "frontend:support" "backend:support" "devops:active"
            ;;
        "deployment")
            echo "デプロイフェーズ: DevOps中心構成"
            configure_agents "devops:primary" "qa:support" "boss:monitor"
            ;;
    esac
}

# 負荷に応じたスケーリング
auto_scale_agents() {
    local current_load=$(get_system_load)
    
    if [ $current_load -gt 80 ]; then
        echo "高負荷検出: エージェント追加"
        spawn_additional_agents
    elif [ $current_load -lt 30 ]; then
        echo "低負荷検出: エージェント削減"
        reduce_agents
    fi
}

# 障害時の自動フェイルオーバー
failover_management() {
    local failed_agent=$1
    
    case $failed_agent in
        "frontend")
            echo "フロントエンドエージェント障害: バックアップエージェント起動"
            spawn_backup_agent "frontend" "frontend-backup"
            ;;
        "backend")
            echo "バックエンドエージェント障害: 負荷を他のエージェントに分散"
            redistribute_backend_load
            ;;
    esac
}

# メイン監視ループ
main() {
    while true; do
        current_phase=$(detect_project_phase)
        adapt_to_project_phase $current_phase
        
        auto_scale_agents
        check_agent_health
        
        sleep 60
    done
}

main "$@"
EOF

chmod +x scripts/adaptive-workflow.sh
```

## 🔧 Advanced Customization & Extensions

### Custom Agent Personalities

```bash
# カスタムエージェント個性設定
cat > configs/agent-personalities.json << 'EOF'
{
  "personalities": {
    "frontend_specialist": {
      "name": "Alex Frontend",
      "expertise": ["React", "Vue.js", "CSS", "UX/UI"],
      "personality_traits": [
        "Detail-oriented with visual design",
        "Performance-conscious",
        "User experience focused",
        "Modern framework enthusiast"
      ],
      "communication_style": "Clear, visual-oriented explanations with examples",
      "preferred_tools": ["Figma", "Storybook", "Chrome DevTools"],
      "initialization_prompt": "You are Alex, a frontend specialist. You care deeply about user experience, visual design, and performance. Always consider mobile-first design and accessibility."
    },
    "backend_architect": {
      "name": "Morgan Backend",
      "expertise": ["Node.js", "Python", "Java", "Databases", "APIs"],
      "personality_traits": [
        "System design focused",
        "Security-conscious",
        "Scalability minded",
        "Data integrity advocate"
      ],
      "communication_style": "Technical, systematic, with performance metrics",
      "preferred_tools": ["Postman", "Docker", "Database profilers"],
      "initialization_prompt": "You are Morgan, a backend architect. You prioritize system reliability, security, and scalability. Always consider performance implications and data consistency."
    },
    "devops_engineer": {
      "name": "Casey DevOps",
      "expertise": ["Docker", "Kubernetes", "CI/CD", "Cloud platforms"],
      "personality_traits": [
        "Automation enthusiast",
        "Reliability focused",
        "Infrastructure as code advocate",
        "Monitoring and observability minded"
      ],
      "communication_style": "Infrastructure-focused, with metrics and monitoring emphasis",
      "preferred_tools": ["Terraform", "Ansible", "Prometheus", "Grafana"],
      "initialization_prompt": "You are Casey, a DevOps engineer. You believe in automation, infrastructure as code, and comprehensive monitoring. Always think about scalability and reliability."
    }
  }
}
EOF
```

### Plugin System Architecture

```bash
# プラグインシステムの実装
cat > scripts/plugin-manager.sh << 'EOF'
#!/bin/bash

PLUGIN_DIR="plugins"
ACTIVE_PLUGINS_FILE="configs/active-plugins.conf"

# プラグイン発見
discover_plugins() {
    echo "利用可能なプラグイン:"
    for plugin in $PLUGIN_DIR/*/plugin.json; do
        if [ -f "$plugin" ]; then
            local plugin_name=$(jq -r '.name' "$plugin")
            local plugin_version=$(jq -r '.version' "$plugin")
            local plugin_description=$(jq -r '.description' "$plugin")
            
            echo "  $plugin_name ($plugin_version): $plugin_description"
        fi
    done
}

# プラグイン有効化
enable_plugin() {
    local plugin_name=$1
    local plugin_path="$PLUGIN_DIR/$plugin_name"
    
    if [ -f "$plugin_path/plugin.json" ]; then
        echo "プラグイン有効化: $plugin_name"
        
        # 依存関係チェック
        check_plugin_dependencies "$plugin_path/plugin.json"
        
        # プラグイン初期化スクリプト実行
        if [ -f "$plugin_path/init.sh" ]; then
            bash "$plugin_path/init.sh"
        fi
        
        # アクティブプラグインリストに追加
        echo "$plugin_name" >> "$ACTIVE_PLUGINS_FILE"
        
        echo "✅ $plugin_name が有効化されました"
    else
        echo "❌ プラグインが見つかりません: $plugin_name"
    fi
}

# カスタムプラグイン例: Slack統合
create_slack_plugin() {
    local plugin_dir="$PLUGIN_DIR/slack-integration"
    mkdir -p "$plugin_dir"
    
    cat > "$plugin_dir/plugin.json" << PLUGIN_JSON
{
  "name": "slack-integration",
  "version": "1.0.0",
  "description": "Slack notification integration for multi-agent system",
  "dependencies": ["curl", "jq"],
  "hooks": ["on_task_complete", "on_error", "on_deployment"]
}
PLUGIN_JSON

    cat > "$plugin_dir/init.sh" << PLUGIN_INIT
#!/bin/bash
echo "Slack統合プラグイン初期化中..."

# Webhook URL設定
if [ -z "\$SLACK_WEBHOOK_URL" ]; then
    echo "警告: SLACK_WEBHOOK_URL が設定されていません"
fi

# フック関数定義
send_slack_notification() {
    local message=\$1
    local channel=\${2:-"#development"}
    
    curl -X POST -H 'Content-type: application/json' \\
        --data "{\"channel\":\"\$channel\",\"text\":\"\$message\"}" \\
        \$SLACK_WEBHOOK_URL
}

# エージェント完了時の通知フック
on_task_complete() {
    local agent_name=\$1
    local task_description=\$2
    
    send_slack_notification "✅ \$agent_name がタスクを完了しました: \$task_description"
}

# エラー発生時の通知フック
on_error() {
    local agent_name=\$1
    local error_message=\$2
    
    send_slack_notification "🚨 \$agent_name でエラーが発生しました: \$error_message" "#alerts"
}

echo "Slack統合プラグイン初期化完了"
PLUGIN_INIT

    chmod +x "$plugin_dir/init.sh"
    echo "Slack統合プラグインを作成しました: $plugin_dir"
}

# 使用例
discover_plugins
create_slack_plugin
enable_plugin "slack-integration"
EOF

chmod +x scripts/plugin-manager.sh
```

## 📊 Analytics & Optimization

### Performance Analytics Dashboard

```bash
# パフォーマンス分析ダッシュボード
cat > scripts/analytics-dashboard.sh << 'EOF'
#!/bin/bash

# メトリクス収集
collect_metrics() {
    local metrics_file="logs/metrics-$(date +%Y%m%d-%H%M%S).json"
    
    echo "メトリクス収集開始..."
    
    # システムメトリクス
    cat > "$metrics_file" << METRICS
{
  "timestamp": "$(date -Iseconds)",
  "system": {
    "cpu_usage": $(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1),
    "memory_usage": $(free | grep Mem | awk '{printf "%.2f", $3/$2 * 100.0}'),
    "disk_usage": $(df -h / | awk 'NR==2{print $5}' | cut -d'%' -f1)
  },
  "agents": {
METRICS

    # 各エージェントのメトリクス
    for agent in boss frontend backend database devops qa; do
        if tmux list-windows -t multiagent 2>/dev/null | grep -q $agent; then
            local response_time=$(measure_agent_response_time $agent)
            local task_count=$(get_agent_task_count $agent)
            
            cat >> "$metrics_file" << AGENT_METRICS
    "$agent": {
      "status": "active",
      "response_time_ms": $response_time,
      "completed_tasks": $task_count,
      "last_activity": "$(get_agent_last_activity $agent)"
    },
AGENT_METRICS
        fi
    done
    
    echo "  }" >> "$metrics_file"
    echo "}" >> "$metrics_file"
    
    echo "メトリクス収集完了: $metrics_file"
}

# リアルタイム監視
real_time_monitoring() {
    echo "リアルタイム監視開始 (Ctrl+C で終了)"
    
    while true; do
        clear
        echo "=== Multi-Agent System Dashboard ==="
        echo "時刻: $(date)"
        echo
        
        echo "📊 システム状態:"
        echo "  CPU: $(top -bn1 | grep "Cpu(s)" | awk '{print $2}')%"
        echo "  Memory: $(free | grep Mem | awk '{printf "%.1f", $3/$2 * 100.0}')%"
        echo "  Load: $(uptime | awk -F'load average:' '{print $2}')"
        echo
        
        echo "🤖 エージェント状態:"
        for agent in boss frontend backend database devops qa; do
            if tmux list-windows -t multiagent 2>/dev/null | grep -q $agent; then
                echo "  ✅ $agent: アクティブ"
            else
                echo "  ❌ $agent: 非アクティブ"
            fi
        done
        
        echo
        echo "📈 今日のメトリクス:"
        echo "  完了タスク: $(count_completed_tasks_today)"
        echo "  平均応答時間: $(calculate_average_response_time)ms"
        echo "  エラー率: $(calculate_error_rate)%"
        
        sleep 5
    done
}

# 最適化提案生成
generate_optimization_suggestions() {
    echo "システム最適化分析中..."
    
    # CPU使用率チェック
    local cpu_usage=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1)
    if (( $(echo "$cpu_usage > 80" | bc -l) )); then
        echo "⚠️  高CPU使用率検出 ($cpu_usage%)"
        echo "   推奨: エージェント数の削減またはタスク分散を検討"
    fi
    
    # メモリ使用率チェック
    local mem_usage=$(free | grep Mem | awk '{printf "%.2f", $3/$2 * 100.0}')
    if (( $(echo "$mem_usage > 90" | bc -l) )); then
        echo "⚠️  高メモリ使用率検出 ($mem_usage%)"
        echo "   推奨: tmuxセッションの再起動またはシステム再起動を検討"
    fi
    
    # 応答時間チェック
    local avg_response=$(calculate_average_response_time)
    if [ "$avg_response" -gt 5000 ]; then
        echo "⚠️  応答時間が遅延 (${avg_response}ms)"
        echo "   推奨: Claude APIの制限確認またはネットワーク接続チェック"
    fi
}

# メイン実行
case "${1:-monitor}" in
    "collect")
        collect_metrics
        ;;
    "monitor")
        real_time_monitoring
        ;;
    "optimize")
        generate_optimization_suggestions
        ;;
    *)
        echo "使用方法: $0 [collect|monitor|optimize]"
        ;;
esac
EOF

chmod +x scripts/analytics-dashboard.sh
```

## 🎓 Graduation Project: Enterprise Multi-Agent System

### 最終課題: 企業級マルチエージェントシステム構築

```bash
# 企業級システムの要件定義
cat > final-project-requirements.md << 'EOF'
# 最終課題: Enterprise Multi-Agent Development System

## 🎯 プロジェクト目標
実際の企業開発で使用可能なマルチエージェントシステムを構築する

## 📋 必須機能
1. **エージェント管理**
   - 動的エージェント追加・削除
   - 負荷分散
   - 障害回復

2. **ワークフロー自動化**
   - Git統合
   - CI/CD パイプライン
   - 自動テスト・デプロイ

3. **コミュニケーション**
   - Slack/Teams統合
   - メール通知
   - ダッシュボード

4. **品質保証**
   - 自動コードレビュー
   - セキュリティスキャン
   - パフォーマンス監視

5. **スケーラビリティ**
   - クラウド対応
   - コンテナ化
   - マイクロサービス化

## 🏆 評価基準
- 機能の完全性 (40%)
- システムの安定性 (30%)
- 拡張性・保守性 (20%)
- ドキュメント品質 (10%)

## 📅 開発期間
2週間（実際の企業プロジェクトを想定）
EOF
```

## 🎉 修了証明

### スキル認定システム

```bash
# スキル認定テスト
cat > scripts/skill-certification.sh << 'EOF'
#!/bin/bash

echo "🎓 tmux + Claude Multi-Agent スキル認定テスト"
echo "================================================"

# テスト項目
declare -A tests=(
    ["basic_tmux"]="tmuxの基本操作ができる"
    ["claude_integration"]="Claude Code との統合ができる"
    ["agent_communication"]="エージェント間通信ができる"
    ["workflow_automation"]="ワークフロー自動化ができる"
    ["enterprise_deployment"]="企業レベるでのデプロイができる"
)

# スコア管理
total_score=0
max_score=${#tests[@]}

# 各テストの実行
for test_name in "${!tests[@]}"; do
    echo
    echo "テスト: ${tests[$test_name]}"
    echo -n "実行中... "
    
    if run_test "$test_name"; then
        echo "✅ 合格"
        ((total_score++))
    else
        echo "❌ 不合格"
    fi
done

# 結果発表
echo
echo "================================================"
echo "🏆 認定結果: $total_score/$max_score"

if [ $total_score -eq $max_score ]; then
    echo "🎉 おめでとうございます！"
    echo "   tmux + Claude Multi-Agent Expert 認定"
    generate_certificate
elif [ $total_score -ge 3 ]; then
    echo "👍 良い結果です！"
    echo "   tmux + Claude Multi-Agent Practitioner 認定"
    generate_certificate
else
    echo "📚 再学習をお勧めします"
    echo "   不足分野の確認を行ってください"
fi
EOF

chmod +x scripts/skill-certification.sh
```

## 📚 まとめ

この教材で学んだ内容：

### 🎯 基礎から応用まで
1. **導入編**: tmuxとClaude Codeの基本概念
2. **環境構築**: 実際のセットアップ手順
3. **基本操作**: 日常的な操作方法
4. **実践編**: 実際のプロジェクト開発
5. **応用編**: 企業級システム構築

### 🚀 次のステップ
- コミュニティ参加
- オープンソースプロジェクトへの貢献
- 企業での実践的活用
- カスタムプラグイン開発

### 🤝 コミュニティとサポート
- GitHub Discussions
- Discord サーバー
- 定期的なオンライン勉強会
- 企業導入サポート

---

**前章**: [第4章: 実践編](./chapter04.md)  
**完了**: 5/5章完了 (100%) 🎉

**次は**: [用語集](../glossary/README.md) | [FAQ](../faq/README.md) | [認定テスト](../certification/)

お疲れさまでした！これでtmux + Claude Multi-Agent システムのマスターです！
import React, { useState, useEffect, useRef } from 'react';
import './MockTerminal.css';

const MockTerminal = ({ chapter = 1, scenario = 'basic' }) => {
  const [currentLine, setCurrentLine] = useState('');
  const [history, setHistory] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const terminalRef = useRef(null);
  
  // 章別シナリオ定義
  const scenarios = {
    basic: {
      title: 'tmux基本操作体験',
      steps: [
        {
          prompt: '$ ',
          expectedCommand: 'tmux new-session -s tutorial',
          description: 'tmuxセッションを作成してください',
          hint: 'tmux new-session -s [session_name]',
          success: '✅ tmuxセッション "tutorial" を作成しました',
          error: '❌ 正しいコマンドを入力してください。ヒント: tmux new-session -s tutorial'
        },
        {
          prompt: '[tutorial] $ ',
          expectedCommand: 'tmux split-window -h',
          description: 'ウィンドウを縦に分割してください',
          hint: 'tmux split-window -h',
          success: '✅ ウィンドウを縦に分割しました',
          error: '❌ ウィンドウ分割コマンドが間違っています'
        },
        {
          prompt: '[tutorial] $ ',
          expectedCommand: 'claude',
          description: 'Claude Codeを起動してください',
          hint: 'claude',
          success: '✅ Claude Codeを起動しました！\n🎉 基本操作完了！',
          error: '❌ Claude Code起動コマンドを入力してください'
        }
      ]
    },
    multiagent: {
      title: 'マルチエージェント環境構築',
      steps: [
        {
          prompt: '$ ',
          expectedCommand: './scripts/start-multiagent.sh',
          description: 'マルチエージェント環境を起動してください',
          hint: './scripts/start-multiagent.sh',
          success: '✅ マルチエージェント環境を起動中...',
          error: '❌ 起動スクリプトのパスを確認してください'
        },
        {
          prompt: '$ ',
          expectedCommand: 'tmux attach-session -t multiagent',
          description: 'multiagentセッションにアタッチしてください',
          hint: 'tmux attach-session -t [session_name]',
          success: '✅ マルチエージェントセッションに接続しました',
          error: '❌ セッション名を正しく指定してください'
        },
        {
          prompt: '[multiagent:boss] $ ',
          expectedCommand: './agent-send.sh frontend "Hello from boss"',
          description: 'frontendエージェントにメッセージを送信してください',
          hint: './agent-send.sh [target] "[message]"',
          success: '✅ メッセージを送信しました！\n📡 エージェント間通信成功！',
          error: '❌ メッセージ送信の構文を確認してください'
        }
      ]
    },
    advanced: {
      title: 'プロジェクト開発シミュレーション',
      steps: [
        {
          prompt: '[multiagent:boss] $ ',
          expectedCommand: './agent-send.sh frontend "React TodoアプリのUI作成をお願いします"',
          description: 'frontendエージェントにタスクを依頼してください',
          hint: './agent-send.sh frontend "[具体的なタスク内容]"',
          success: '✅ フロントエンドタスクを依頼しました',
          error: '❌ より具体的なタスク内容を記載してください'
        },
        {
          prompt: '[multiagent:boss] $ ',
          expectedCommand: './agent-send.sh backend "Todo管理APIを作成してください"',
          description: 'backendエージェントにAPIタスクを依頼してください',
          hint: './agent-send.sh backend "[API関連のタスク]"',
          success: '✅ バックエンドタスクを依頼しました',
          error: '❌ API作成タスクを正しく記載してください'
        },
        {
          prompt: '[multiagent:boss] $ ',
          expectedCommand: './scripts/progress-report.sh',
          description: '進捗レポートを確認してください',
          hint: './scripts/progress-report.sh',
          success: '✅ 全エージェントの進捗を確認しました！\n🎯 プロジェクト管理完了！',
          error: '❌ 進捗レポートスクリプトを実行してください'
        }
      ]
    }
  };

  const currentScenario = scenarios[scenario] || scenarios.basic;
  const currentStepData = currentScenario.steps[currentStep];

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [history]);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleCommand();
    }
  };

  const handleCommand = () => {
    if (!currentStepData || isProcessing) return;

    setIsProcessing(true);
    const command = currentLine.trim();
    
    // コマンド履歴に追加
    const newHistoryItem = {
      prompt: currentStepData.prompt,
      command: command,
      timestamp: new Date().toLocaleTimeString()
    };

    setHistory(prev => [...prev, newHistoryItem]);
    setCurrentLine('');

    // コマンド判定（部分一致も許可）
    const isCorrect = command.toLowerCase().includes(
      currentStepData.expectedCommand.toLowerCase()
    ) || command === currentStepData.expectedCommand;

    setTimeout(() => {
      if (isCorrect) {
        // 成功時の処理
        setHistory(prev => [...prev, {
          type: 'success',
          message: currentStepData.success,
          timestamp: new Date().toLocaleTimeString()
        }]);

        if (currentStep < currentScenario.steps.length - 1) {
          setCurrentStep(prev => prev + 1);
        } else {
          // シナリオ完了
          setTimeout(() => {
            setHistory(prev => [...prev, {
              type: 'completion',
              message: '🎊 シナリオ完了！次の章に進みましょう。',
              timestamp: new Date().toLocaleTimeString()
            }]);
          }, 1000);
        }
      } else {
        // エラー時の処理
        setHistory(prev => [...prev, {
          type: 'error',
          message: currentStepData.error,
          timestamp: new Date().toLocaleTimeString()
        }]);
      }
      setIsProcessing(false);
    }, 1000);
  };

  const resetTerminal = () => {
    setHistory([]);
    setCurrentStep(0);
    setCurrentLine('');
    setIsProcessing(false);
  };

  const showHint = () => {
    if (currentStepData) {
      setHistory(prev => [...prev, {
        type: 'hint',
        message: `💡 ヒント: ${currentStepData.hint}`,
        timestamp: new Date().toLocaleTimeString()
      }]);
    }
  };

  return (
    <div className="mock-terminal">
      <div className="terminal-header">
        <div className="terminal-controls">
          <span className="control-button close"></span>
          <span className="control-button minimize"></span>
          <span className="control-button maximize"></span>
        </div>
        <div className="terminal-title">{currentScenario.title}</div>
        <div className="terminal-actions">
          <button onClick={showHint} className="hint-button">💡 ヒント</button>
          <button onClick={resetTerminal} className="reset-button">🔄 リセット</button>
        </div>
      </div>

      <div className="terminal-body" ref={terminalRef}>
        <div className="terminal-content">
          {/* 初期メッセージ */}
          <div className="welcome-message">
            <div className="ascii-art">
╔══════════════════════════════════════╗
║     🎯 tmux + Claude 実践教材        ║
║    Interactive Terminal Simulator    ║
╚══════════════════════════════════════╝
            </div>
            <div className="scenario-info">
              <h3>{currentScenario.title}</h3>
              <p>進捗: {currentStep + 1} / {currentScenario.steps.length}</p>
            </div>
          </div>

          {/* コマンド履歴 */}
          {history.map((item, index) => (
            <div key={index} className={`history-item ${item.type || 'command'}`}>
              {item.type === 'success' && (
                <div className="success-message">{item.message}</div>
              )}
              {item.type === 'error' && (
                <div className="error-message">{item.message}</div>
              )}
              {item.type === 'hint' && (
                <div className="hint-message">{item.message}</div>
              )}
              {item.type === 'completion' && (
                <div className="completion-message">{item.message}</div>
              )}
              {!item.type && (
                <div className="command-line">
                  <span className="prompt">{item.prompt}</span>
                  <span className="command">{item.command}</span>
                  <span className="timestamp">[{item.timestamp}]</span>
                </div>
              )}
            </div>
          ))}

          {/* 現在のステップ説明 */}
          {currentStepData && currentStep < currentScenario.steps.length && (
            <div className="step-description">
              <div className="step-info">
                <span className="step-number">Step {currentStep + 1}:</span>
                <span className="step-text">{currentStepData.description}</span>
              </div>
            </div>
          )}

          {/* 現在の入力行 */}
          {currentStepData && currentStep < currentScenario.steps.length && (
            <div className="current-line">
              <span className="prompt">{currentStepData.prompt}</span>
              <input
                type="text"
                value={currentLine}
                onChange={(e) => setCurrentLine(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isProcessing}
                className="command-input"
                placeholder="コマンドを入力..."
                autoFocus
              />
              {isProcessing && <span className="processing">⏳</span>}
            </div>
          )}

          {/* 進捗バー */}
          <div className="progress-container">
            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{ width: `${((currentStep + 1) / currentScenario.steps.length) * 100}%` }}
              ></div>
            </div>
            <div className="progress-text">
              {Math.round(((currentStep + 1) / currentScenario.steps.length) * 100)}% 完了
            </div>
          </div>
        </div>
      </div>

      <div className="terminal-footer">
        <div className="keyboard-shortcuts">
          <span>💻 Enter: コマンド実行</span>
          <span>💡 ヒントボタン: 解答のヒント</span>
          <span>🔄 リセット: 最初から再開</span>
        </div>
      </div>
    </div>
  );
};

export default MockTerminal;
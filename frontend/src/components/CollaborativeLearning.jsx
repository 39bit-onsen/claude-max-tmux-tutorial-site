import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTheme } from '../hooks/useTheme';
import './CollaborativeLearning.css';

const CollaborativeLearning = ({ 
  currentChapter = 1,
  userName = 'Anonymous',
  userId,
  onProgressUpdate,
  socketUrl = 'ws://localhost:3001'
}) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [sessionMembers, setSessionMembers] = useState([]);
  const [currentSession, setCurrentSession] = useState(null);
  const [sharedProgress, setSharedProgress] = useState({});
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [cursorPositions, setCursorPositions] = useState({});
  const [sharedCode, setSharedCode] = useState('');
  const [sessionCode, setSessionCode] = useState('');
  const [isHost, setIsHost] = useState(false);
  const { theme } = useTheme();
  
  const chatRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const heartbeatRef = useRef(null);

  // Socket.io接続管理
  const connectSocket = useCallback(() => {
    try {
      // WebSocket接続（実際の実装ではSocket.ioを使用）
      const ws = new WebSocket(socketUrl.replace('http', 'ws'));
      
      ws.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        
        // ユーザー認証
        ws.send(JSON.stringify({
          type: 'user_auth',
          data: {
            userId,
            userName,
            currentChapter
          }
        }));
        
        // ハートビート開始
        heartbeatRef.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'ping' }));
          }
        }, 30000);
      };
      
      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          handleSocketMessage(message);
        } catch (error) {
          console.error('Message parsing error:', error);
        }
      };
      
      ws.onclose = () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
        setSocket(null);
        
        if (heartbeatRef.current) {
          clearInterval(heartbeatRef.current);
        }
        
        // 自動再接続
        if (!reconnectTimeoutRef.current) {
          reconnectTimeoutRef.current = setTimeout(() => {
            connectSocket();
            reconnectTimeoutRef.current = null;
          }, 3000);
        }
      };
      
      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
      
      setSocket(ws);
    } catch (error) {
      console.error('Socket connection failed:', error);
    }
  }, [socketUrl, userId, userName, currentChapter]);

  // Socket メッセージハンドラー
  const handleSocketMessage = (message) => {
    switch (message.type) {
      case 'session_joined':
        setCurrentSession(message.data.session);
        setSessionMembers(message.data.members);
        setIsHost(message.data.isHost);
        break;
        
      case 'session_updated':
        setSessionMembers(message.data.members);
        break;
        
      case 'progress_sync':
        setSharedProgress(message.data.progress);
        break;
        
      case 'chat_message':
        setChatMessages(prev => [...prev, message.data]);
        break;
        
      case 'cursor_position':
        setCursorPositions(prev => ({
          ...prev,
          [message.data.userId]: message.data.position
        }));
        break;
        
      case 'code_sync':
        setSharedCode(message.data.code);
        break;
        
      case 'user_disconnected':
        setSessionMembers(prev => prev.filter(m => m.userId !== message.data.userId));
        break;
        
      case 'error':
        console.error('Socket error:', message.data.message);
        break;
        
      default:
        console.log('Unknown message type:', message.type);
    }
  };

  // セッション作成
  const createSession = () => {
    if (!socket || !isConnected) return;
    
    const newSessionCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    setSessionCode(newSessionCode);
    
    socket.send(JSON.stringify({
      type: 'create_session',
      data: {
        sessionCode: newSessionCode,
        chapter: currentChapter,
        hostName: userName
      }
    }));
  };

  // セッション参加
  const joinSession = () => {
    if (!socket || !isConnected || !sessionCode) return;
    
    socket.send(JSON.stringify({
      type: 'join_session',
      data: {
        sessionCode: sessionCode.toUpperCase(),
        userName
      }
    }));
  };

  // セッション退出
  const leaveSession = () => {
    if (!socket || !currentSession) return;
    
    socket.send(JSON.stringify({
      type: 'leave_session',
      data: {
        sessionCode: currentSession.code
      }
    }));
    
    setCurrentSession(null);
    setSessionMembers([]);
    setSharedProgress({});
    setChatMessages([]);
    setSessionCode('');
  };

  // 進捗同期
  const syncProgress = (progress) => {
    if (!socket || !currentSession) return;
    
    socket.send(JSON.stringify({
      type: 'sync_progress',
      data: {
        sessionCode: currentSession.code,
        progress,
        timestamp: Date.now()
      }
    }));
    
    if (onProgressUpdate) {
      onProgressUpdate(progress);
    }
  };

  // チャットメッセージ送信
  const sendChatMessage = () => {
    if (!socket || !currentSession || !newMessage.trim()) return;
    
    const message = {
      userId,
      userName,
      content: newMessage.trim(),
      timestamp: Date.now(),
      type: 'text'
    };
    
    socket.send(JSON.stringify({
      type: 'chat_message',
      data: {
        sessionCode: currentSession.code,
        message
      }
    }));
    
    setNewMessage('');
  };

  // カーソル位置同期
  const syncCursorPosition = (position) => {
    if (!socket || !currentSession) return;
    
    socket.send(JSON.stringify({
      type: 'cursor_position',
      data: {
        sessionCode: currentSession.code,
        position,
        timestamp: Date.now()
      }
    }));
  };

  // コード同期
  const syncCode = (code) => {
    if (!socket || !currentSession) return;
    
    socket.send(JSON.stringify({
      type: 'code_sync',
      data: {
        sessionCode: currentSession.code,
        code,
        timestamp: Date.now()
      }
    }));
  };

  // 初期化
  useEffect(() => {
    connectSocket();
    
    return () => {
      if (socket) {
        socket.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (heartbeatRef.current) {
        clearInterval(heartbeatRef.current);
      }
    };
  }, [connectSocket]);

  // チャット自動スクロール
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [chatMessages]);

  // 進捗バー計算
  const calculateOverallProgress = () => {
    if (Object.keys(sharedProgress).length === 0) return 0;
    
    const totalProgress = Object.values(sharedProgress).reduce((sum, progress) => {
      return sum + (progress.currentStep / progress.totalSteps) * 100;
    }, 0);
    
    return Math.round(totalProgress / Object.keys(sharedProgress).length);
  };

  return (
    <div className="collaborative-learning">
      <div className="collaboration-header">
        <h2>👥 共同学習セッション</h2>
        <div className="connection-status">
          <span className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}>
            {isConnected ? '🟢 接続中' : '🔴 切断中'}
          </span>
        </div>
      </div>

      {!currentSession ? (
        /* セッション管理パネル */
        <div className="session-management">
          <div className="session-actions">
            <div className="create-session">
              <h3>🚀 新しいセッションを作成</h3>
              <p>他の学習者を招待して一緒に学習しましょう</p>
              <button
                onClick={createSession}
                disabled={!isConnected}
                className="create-button"
              >
                セッション作成
              </button>
            </div>

            <div className="join-session">
              <h3>🔗 既存のセッションに参加</h3>
              <p>セッションコードを入力してください</p>
              <div className="join-form">
                <input
                  type="text"
                  value={sessionCode}
                  onChange={(e) => setSessionCode(e.target.value.toUpperCase())}
                  placeholder="例: ABC123"
                  className="session-code-input"
                  maxLength={6}
                />
                <button
                  onClick={joinSession}
                  disabled={!isConnected || !sessionCode}
                  className="join-button"
                >
                  参加
                </button>
              </div>
            </div>
          </div>

          <div className="collaboration-benefits">
            <h3>✨ 共同学習の特徴</h3>
            <ul>
              <li>📊 リアルタイム進捗共有</li>
              <li>💬 チーム内チャット</li>
              <li>👀 カーソル位置同期</li>
              <li>📝 コード共有機能</li>
              <li>🎯 グループ目標設定</li>
            </ul>
          </div>
        </div>
      ) : (
        /* アクティブセッション */
        <div className="active-session">
          {/* セッション情報 */}
          <div className="session-info">
            <div className="session-details">
              <h3>📋 セッション: {currentSession.code}</h3>
              <p>第{currentChapter}章 - {sessionMembers.length}人参加中</p>
              {isHost && <span className="host-badge">👑 ホスト</span>}
            </div>
            <button onClick={leaveSession} className="leave-button">
              退出
            </button>
          </div>

          {/* メンバー一覧 */}
          <div className="session-members">
            <h4>👥 参加メンバー</h4>
            <div className="members-list">
              {sessionMembers.map((member, index) => (
                <div key={member.userId} className="member-card">
                  <div 
                    className="member-avatar"
                    style={{ backgroundColor: `hsl(${index * 60}, 70%, 50%)` }}
                  >
                    {member.userName.charAt(0).toUpperCase()}
                  </div>
                  <div className="member-info">
                    <span className="member-name">{member.userName}</span>
                    <span className="member-progress">
                      {sharedProgress[member.userId] ? 
                        `${Math.round((sharedProgress[member.userId].currentStep / sharedProgress[member.userId].totalSteps) * 100)}%` : 
                        '0%'
                      }
                    </span>
                  </div>
                  {member.isHost && <span className="member-host">👑</span>}
                </div>
              ))}
            </div>
          </div>

          {/* 全体進捗 */}
          <div className="shared-progress">
            <h4>📊 チーム進捗</h4>
            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{ width: `${calculateOverallProgress()}%` }}
              ></div>
            </div>
            <span className="progress-text">
              {calculateOverallProgress()}% 完了
            </span>
          </div>

          {/* チャット */}
          <div className="chat-section">
            <h4>💬 チームチャット</h4>
            <div className="chat-messages" ref={chatRef}>
              {chatMessages.map((message, index) => (
                <div 
                  key={index} 
                  className={`chat-message ${message.userId === userId ? 'own-message' : 'other-message'}`}
                >
                  <div className="message-header">
                    <span className="message-author">{message.userName}</span>
                    <span className="message-time">
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="message-content">{message.content}</div>
                </div>
              ))}
            </div>
            
            <div className="chat-input">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                placeholder="メッセージを入力..."
                className="message-input"
              />
              <button 
                onClick={sendChatMessage}
                disabled={!newMessage.trim()}
                className="send-button"
              >
                送信
              </button>
            </div>
          </div>

          {/* 共有コードエリア */}
          <div className="shared-code">
            <h4>📝 共有コード</h4>
            <textarea
              value={sharedCode}
              onChange={(e) => {
                setSharedCode(e.target.value);
                syncCode(e.target.value);
              }}
              placeholder="チームでコードを共有しましょう..."
              className="code-editor"
              rows={8}
            />
            
            {/* カーソル位置表示 */}
            <div className="cursor-positions">
              {Object.entries(cursorPositions).map(([userId, position]) => {
                const member = sessionMembers.find(m => m.userId === userId);
                if (!member || userId === userId) return null;
                
                return (
                  <div 
                    key={userId}
                    className="cursor-indicator"
                    style={{ 
                      top: position.line * 20,
                      left: position.column * 8
                    }}
                  >
                    <span className="cursor-label">{member.userName}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 学習目標 */}
          <div className="team-goals">
            <h4>🎯 チーム目標</h4>
            <div className="goals-list">
              <div className="goal-item">
                <span className="goal-text">全員で第{currentChapter}章を完了する</span>
                <span className="goal-progress">
                  {sessionMembers.filter(m => 
                    sharedProgress[m.userId]?.currentStep >= (sharedProgress[m.userId]?.totalSteps || 1)
                  ).length} / {sessionMembers.length}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 統計情報 */}
      <div className="collaboration-stats">
        <h4>📈 セッション統計</h4>
        <div className="stats-grid">
          <div className="stat-item">
            <span className="stat-value">{sessionMembers.length}</span>
            <span className="stat-label">参加者数</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{chatMessages.length}</span>
            <span className="stat-label">チャット数</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{calculateOverallProgress()}%</span>
            <span className="stat-label">全体進捗</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollaborativeLearning;
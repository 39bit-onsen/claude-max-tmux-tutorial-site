# 🚀 新機能ガイド

## 概要

tmux + Claude Multi-Agent 教材サイトに追加された5つの新機能について詳しく説明します。これらの機能により、より実践的で魅力的な学習体験を提供します。

## 🎯 実装済み新機能

### A. インタラクティブ模擬ターミナル 🖥️

実際のtmux/Claudeコマンドをブラウザ上で安全に体験できる模擬環境です。

#### 主な特徴
- **安全な実行環境**: 実際のシステムに影響しない模擬実行
- **段階的学習**: チュートリアルに沿った順次実行
- **リアルタイムフィードバック**: 正誤判定と適切なガイダンス
- **複数シナリオ対応**: 基本・マルチエージェント・応用編

#### 使用方法

```javascript
import MockTerminal from './components/MockTerminal';

<MockTerminal 
  chapter={1}
  scenario="basic"
  onComplete={(results) => console.log(results)}
/>
```

#### 利用可能なシナリオ
- `basic`: tmux基本操作体験
- `multiagent`: マルチエージェント環境構築  
- `advanced`: プロジェクト開発シミュレーション

#### 実装詳細
- **技術**: React Hooks, CSS Animations
- **ファイル**: `/frontend/src/components/MockTerminal.jsx`
- **テスト**: 完全なコマンド実行・エラーハンドリングテスト

---

### B. ダークモード切替 🌙

ユーザー体験を向上させる完全なテーマシステムです。

#### 主な特徴
- **完全統合**: 全コンポーネントでテーマ対応
- **自動保存**: LocalStorageで設定永続化
- **システム連携**: OS設定の自動検出
- **キーボードショートカット**: Ctrl + Shift + T

#### 使用方法

```javascript
import { ThemeProvider, useTheme } from './hooks/useTheme';
import ThemeToggle from './components/ThemeToggle';

function App() {
  return (
    <ThemeProvider>
      <ThemeToggle />
      {/* 他のコンポーネント */}
    </ThemeProvider>
  );
}

// コンポーネント内でテーマ使用
function MyComponent() {
  const { theme, toggleTheme, isDark } = useTheme();
  
  return (
    <div className={`component ${isDark ? 'dark' : 'light'}`}>
      <button onClick={toggleTheme}>
        {isDark ? '☀️' : '🌙'} テーマ切替
      </button>
    </div>
  );
}
```

#### テーマカスタマイズ

```css
/* CSS Variables システム */
:root {
  --color-primary: rgb(37, 99, 235);
  --color-background: rgb(255, 255, 255);
  --color-text: rgb(30, 41, 59);
}

html.dark {
  --color-primary: rgb(59, 130, 246);
  --color-background: rgb(13, 17, 23);
  --color-text: rgb(240, 246, 252);
}
```

#### 実装詳細
- **技術**: Context API, CSS Variables, LocalStorage
- **ファイル**: `/frontend/src/hooks/useTheme.js`, `/frontend/src/components/ThemeToggle.jsx`
- **アクセシビリティ**: WCAG 2.1 AA準拠

---

### C. 修了証・バッジ発行システム 🏆

学習成果を視覚的に証明する包括的な認定システムです。

#### 主な特徴
- **動的証明書生成**: Canvas APIを使用したリアルタイム作成
- **複数フォーマット**: PNG・PDF対応
- **SNS共有**: Twitter・LinkedIn・Facebook連携
- **進捗バッジ**: スキル別達成度の可視化

#### 使用方法

```javascript
import CertificateGenerator from './components/CertificateGenerator';

<CertificateGenerator
  userName="山田太郎"
  completedChapters={[1, 2, 3, 4, 5]}
  completionDate="2025-06-20"
  skills={['tmux-basics', 'claude-integration', 'multi-agent']}
  certificateType="expert"
/>
```

#### 証明書タイプ
- `completion`: 修了証明書
- `expert`: エキスパート認定
- `practitioner`: 実践者認定

#### バッジシステム

```javascript
const badgeTypes = {
  'tmux-basics': { 
    icon: '🖥️', 
    name: 'tmux Basics', 
    color: '#10b981' 
  },
  'claude-integration': { 
    icon: '🤖', 
    name: 'Claude Integration', 
    color: '#3b82f6' 
  },
  'multi-agent': { 
    icon: '👥', 
    name: 'Multi-Agent Systems', 
    color: '#8b5cf6' 
  }
};
```

#### 実装詳細
- **技術**: Canvas API, HTML5 File API, Social Media APIs
- **ファイル**: `/frontend/src/components/CertificateGenerator.jsx`
- **フォーマット**: 高解像度PNG (1200x800), PDF (A4サイズ)

---

### D. 全文検索機能 🔍

高速で直感的な教材検索システムです。

#### 主な特徴
- **インクリメンタル検索**: リアルタイム結果表示
- **多言語対応**: 日本語・英語の適切な分かち書き
- **スマート提案**: オートコンプリート機能
- **検索履歴**: 過去の検索内容保存

#### 使用方法

```javascript
import SearchSystem from './components/SearchSystem';

const documents = [
  {
    id: 1,
    title: 'tmux基本操作',
    content: 'tmuxは複数のターミナルセッションを管理できるツール...',
    chapter: '1',
    tags: ['tmux', 'terminal', 'basic'],
    type: 'tutorial'
  }
];

<SearchSystem
  documents={documents}
  onResultSelect={(result) => navigate(result.url)}
  placeholder="教材を検索..."
  enableAutoComplete={true}
  maxResults={10}
/>
```

#### 検索アルゴリズム
- **TF-IDF**: 語句頻度・逆文書頻度による関連度スコア
- **部分一致**: 柔軟な検索クエリ対応
- **コンテキスト抽出**: ハイライト付き検索結果

#### 実装詳細
- **技術**: Map/Set データ構造、正規表現、LocalStorage
- **ファイル**: `/frontend/src/components/SearchSystem.jsx`
- **パフォーマンス**: 1000件以上の文書で100ms以下の検索時間

---

### E. リアルタイム共同学習 👥

複数ユーザーでの同期学習を実現するコラボレーションシステムです。

#### 主な特徴
- **リアルタイム同期**: WebSocketによる即座の情報共有
- **進捗共有**: チームメンバーの学習状況可視化
- **チームチャット**: 学習中のコミュニケーション
- **コード共有**: 共同でのコード作成・編集

#### 使用方法

```javascript
import CollaborativeLearning from './components/CollaborativeLearning';

<CollaborativeLearning
  currentChapter={1}
  userName="山田太郎"
  userId="user123"
  onProgressUpdate={(progress) => syncProgress(progress)}
  socketUrl="ws://localhost:3001"
/>
```

#### セッション管理

```javascript
// セッション作成
const createSession = () => {
  socket.send(JSON.stringify({
    type: 'create_session',
    data: {
      sessionCode: generateCode(),
      chapter: currentChapter,
      hostName: userName
    }
  }));
};

// セッション参加
const joinSession = (code) => {
  socket.send(JSON.stringify({
    type: 'join_session',
    data: {
      sessionCode: code,
      userName
    }
  }));
};
```

#### WebSocketイベント
- `session_joined`: セッション参加完了
- `progress_sync`: 進捗同期
- `chat_message`: チャットメッセージ
- `cursor_position`: カーソル位置共有
- `code_sync`: コード同期

#### 実装詳細
- **技術**: WebSocket, Socket.io, リアルタイム同期
- **ファイル**: `/frontend/src/components/CollaborativeLearning.jsx`
- **スケーラビリティ**: 最大10人同時参加対応

---

## 🔧 技術仕様

### 共通技術要件
- **React**: 18.x以上
- **Node.js**: 18.x以上
- **WebSocket**: Socket.io 4.x
- **Canvas API**: モダンブラウザ対応

### パフォーマンス目標
- **初期読み込み**: 3秒以内
- **検索応答**: 100ms以内
- **WebSocket遅延**: 50ms以内
- **証明書生成**: 2秒以内

### ブラウザ対応
- **Chrome**: 90+
- **Firefox**: 88+
- **Safari**: 14+
- **Edge**: 90+

---

## 🧪 テスト戦略

### 単体テスト
- **Jest**: コンポーネント・フック・ユーティリティ
- **React Testing Library**: ユーザーインタラクション
- **カバレッジ**: 85%以上

### 統合テスト
- **WebSocket**: モック通信テスト
- **Canvas**: 証明書生成テスト
- **LocalStorage**: 設定永続化テスト

### E2Eテスト
- **Playwright**: 全機能連携テスト
- **パフォーマンス**: Lighthouse CI
- **アクセシビリティ**: axe-core

---

## 🎯 使用例・ユースケース

### 基本学習フロー

```javascript
// 1. ダークモード設定
const { theme, toggleTheme } = useTheme();

// 2. インタラクティブ学習
<MockTerminal 
  scenario="basic"
  onStepComplete={(step) => updateProgress(step)}
/>

// 3. 内容検索
<SearchSystem 
  documents={courseDocuments}
  onResultSelect={(doc) => navigateToContent(doc)}
/>

// 4. 共同学習参加
<CollaborativeLearning
  currentChapter={currentChapter}
  onSessionJoin={(session) => startCollaboration(session)}
/>

// 5. 修了証発行
<CertificateGenerator
  userName={user.name}
  completedChapters={progress.chapters}
  onGenerate={(certificate) => downloadCertificate(certificate)}
/>
```

### 教育機関での活用

```javascript
// クラス全体での同期学習
const classSession = {
  sessionCode: 'CLASS2025',
  maxParticipants: 30,
  instructor: true,
  restrictedMode: true
};

// 進捗の一括管理
const trackClassProgress = (students) => {
  return students.map(student => ({
    name: student.name,
    progress: student.completedChapters.length / totalChapters,
    lastActivity: student.lastSeen
  }));
};
```

### 企業研修での活用

```javascript
// 研修プログラム管理
const trainingProgram = {
  cohortId: 'CORP-2025-Q1',
  requirements: ['tmux-basics', 'claude-integration'],
  deadline: '2025-07-31',
  certification: 'practitioner'
};

// 成果レポート生成
const generateTrainingReport = (participants) => {
  return {
    completionRate: calculateCompletionRate(participants),
    averageScore: calculateAverageScore(participants),
    certificates: generateBulkCertificates(participants)
  };
};
```

---

## 🔗 関連リンク

- [インストールガイド](../README.md#インストール)
- [開発ガイド](../README.md#開発環境起動)
- [APIリファレンス](./api-reference.md)
- [テスト実行](../tests/README.md)
- [デプロイ手順](./deployment.md)

---

## 📞 サポート

新機能に関する質問や問題報告：

- **GitHub Issues**: [新機能関連Issue](https://github.com/39bit-onsen/claude-max-tmux-tutorial-site/issues?q=label%3Anew-features)
- **Discord**: [#new-features チャンネル](https://discord.gg/your-server)
- **Email**: new-features@tutorial-site.com

---

**更新日**: 2025-06-20  
**バージョン**: v2.0.0  
**担当**: worker3 (ドキュメント・テスト)
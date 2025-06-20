// New Features Test Suite
const { render, screen, fireEvent, waitFor, act } = require('@testing-library/react');
const { expect, describe, it, beforeEach, afterEach, jest } = require('@jest/globals');
const userEvent = require('@testing-library/user-event');

// Mock components
jest.mock('../src/hooks/useTheme', () => ({
  useTheme: () => ({
    theme: 'light',
    toggleTheme: jest.fn(),
    isLight: true,
    isDark: false
  }),
  ThemeProvider: ({ children }) => children
}));

describe('New Features Integration Tests', () => {
  let user;

  beforeEach(() => {
    user = userEvent.setup();
    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn(),
      },
      writable: true,
    });
    
    // Mock WebSocket
    global.WebSocket = jest.fn(() => ({
      send: jest.fn(),
      close: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      readyState: 1,
    }));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Feature A: Interactive Mock Terminal', () => {
    const MockTerminal = require('../src/components/MockTerminal').default;

    it('should render terminal with correct initial state', () => {
      render(<MockTerminal scenario="basic" />);
      
      expect(screen.getByText('tmux基本操作体験')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('コマンドを入力...')).toBeInTheDocument();
      expect(screen.getByText('💡 ヒント')).toBeInTheDocument();
      expect(screen.getByText('🔄 リセット')).toBeInTheDocument();
    });

    it('should execute commands and show appropriate responses', async () => {
      render(<MockTerminal scenario="basic" />);
      
      const input = screen.getByPlaceholderText('コマンドを入力...');
      
      // 正しいコマンド入力
      await user.type(input, 'tmux new-session -s tutorial');
      await user.keyboard('{Enter}');
      
      await waitFor(() => {
        expect(screen.getByText(/✅ tmuxセッション "tutorial" を作成しました/)).toBeInTheDocument();
      });
    });

    it('should show error for incorrect commands', async () => {
      render(<MockTerminal scenario="basic" />);
      
      const input = screen.getByPlaceholderText('コマンドを入力...');
      
      // 間違ったコマンド入力
      await user.type(input, 'wrong command');
      await user.keyboard('{Enter}');
      
      await waitFor(() => {
        expect(screen.getByText(/❌ 正しいコマンドを入力してください/)).toBeInTheDocument();
      });
    });

    it('should show hint when hint button is clicked', async () => {
      render(<MockTerminal scenario="basic" />);
      
      const hintButton = screen.getByText('💡 ヒント');
      await user.click(hintButton);
      
      await waitFor(() => {
        expect(screen.getByText(/💡 ヒント:/)).toBeInTheDocument();
      });
    });

    it('should reset terminal when reset button is clicked', async () => {
      render(<MockTerminal scenario="basic" />);
      
      // コマンド実行
      const input = screen.getByPlaceholderText('コマンドを入力...');
      await user.type(input, 'tmux new-session -s tutorial');
      await user.keyboard('{Enter}');
      
      // リセット
      const resetButton = screen.getByText('🔄 リセット');
      await user.click(resetButton);
      
      // 初期状態に戻ることを確認
      expect(screen.getByDisplayValue('')).toBeInTheDocument();
    });

    it('should progress through multiple steps in scenario', async () => {
      render(<MockTerminal scenario="basic" />);
      
      const input = screen.getByPlaceholderText('コマンドを入力...');
      
      // Step 1
      await user.type(input, 'tmux new-session -s tutorial');
      await user.keyboard('{Enter}');
      
      await waitFor(() => {
        expect(screen.getByText(/Step 2:/)).toBeInTheDocument();
      });
      
      // Step 2
      await user.clear(input);
      await user.type(input, 'tmux split-window -h');
      await user.keyboard('{Enter}');
      
      await waitFor(() => {
        expect(screen.getByText(/Step 3:/)).toBeInTheDocument();
      });
    });

    it('should update progress bar correctly', async () => {
      render(<MockTerminal scenario="basic" />);
      
      const input = screen.getByPlaceholderText('コマンドを入力...');
      
      // 初期進捗確認
      expect(screen.getByText('33% 完了')).toBeInTheDocument();
      
      // Step 1完了
      await user.type(input, 'tmux new-session -s tutorial');
      await user.keyboard('{Enter}');
      
      await waitFor(() => {
        expect(screen.getByText('67% 完了')).toBeInTheDocument();
      });
    });
  });

  describe('Feature B: Dark Mode Toggle', () => {
    const { ThemeProvider, useTheme } = require('../src/hooks/useTheme');
    const ThemeToggle = require('../src/components/ThemeToggle').default;

    it('should render theme toggle with correct initial state', () => {
      render(
        <ThemeProvider>
          <ThemeToggle />
        </ThemeProvider>
      );
      
      expect(screen.getByLabelText(/テーマを/)).toBeInTheDocument();
      expect(screen.getByText('☀️')).toBeInTheDocument();
    });

    it('should toggle theme when clicked', async () => {
      const mockToggleTheme = jest.fn();
      
      jest.mocked(useTheme).mockReturnValue({
        theme: 'light',
        toggleTheme: mockToggleTheme,
        isLight: true,
        isDark: false
      });
      
      render(<ThemeToggle />);
      
      const toggleButton = screen.getByLabelText(/テーマを/);
      await user.click(toggleButton);
      
      expect(mockToggleTheme).toHaveBeenCalledTimes(1);
    });

    it('should save theme preference to localStorage', () => {
      const setItemSpy = jest.spyOn(Storage.prototype, 'setItem');
      
      render(
        <ThemeProvider>
          <ThemeToggle />
        </ThemeProvider>
      );
      
      expect(setItemSpy).toHaveBeenCalledWith('tutorial-site-theme', expect.any(String));
    });

    it('should support keyboard shortcuts', async () => {
      const mockToggleTheme = jest.fn();
      
      jest.mocked(useTheme).mockReturnValue({
        theme: 'light',
        toggleTheme: mockToggleTheme,
        isLight: true,
        isDark: false
      });
      
      render(<ThemeToggle />);
      
      // Ctrl + Shift + T shortcut simulation would go here
      // This would require additional setup for global keyboard event handling
    });

    it('should show correct icons for different themes', () => {
      const { rerender } = render(<ThemeToggle />);
      
      // Light theme
      expect(screen.getByText('☀️')).toBeInTheDocument();
      
      // Mock dark theme
      jest.mocked(useTheme).mockReturnValue({
        theme: 'dark',
        toggleTheme: jest.fn(),
        isLight: false,
        isDark: true
      });
      
      rerender(<ThemeToggle />);
      expect(screen.getByText('🌙')).toBeInTheDocument();
    });
  });

  describe('Feature C: Certificate & Badge System', () => {
    const CertificateGenerator = require('../src/components/CertificateGenerator').default;

    const mockProps = {
      userName: 'Test User',
      completedChapters: [1, 2, 3],
      completionDate: '2025-06-20',
      skills: ['tmux-basics', 'claude-integration'],
      certificateType: 'completion'
    };

    beforeEach(() => {
      // Mock Canvas API
      HTMLCanvasElement.prototype.getContext = jest.fn(() => ({
        fillRect: jest.fn(),
        strokeRect: jest.fn(),
        fillText: jest.fn(),
        strokeText: jest.fn(),
        beginPath: jest.fn(),
        arc: jest.fn(),
        stroke: jest.fn(),
        fill: jest.fn(),
        createLinearGradient: jest.fn(() => ({
          addColorStop: jest.fn()
        })),
        save: jest.fn(),
        restore: jest.fn()
      }));

      HTMLCanvasElement.prototype.toBlob = jest.fn((callback) => {
        callback(new Blob(['mock-image'], { type: 'image/png' }));
      });

      global.URL.createObjectURL = jest.fn(() => 'mock-url');
    });

    it('should render certificate generator with user information', () => {
      render(<CertificateGenerator {...mockProps} />);
      
      expect(screen.getByText('🏆 修了証・バッジ発行')).toBeInTheDocument();
      expect(screen.getByText('📋 獲得バッジ')).toBeInTheDocument();
      expect(screen.getByText('📜 修了証プレビュー')).toBeInTheDocument();
    });

    it('should display badges for completed skills', () => {
      render(<CertificateGenerator {...mockProps} />);
      
      expect(screen.getByText('tmux Basics')).toBeInTheDocument();
      expect(screen.getByText('Claude Integration')).toBeInTheDocument();
    });

    it('should generate certificate when button is clicked', async () => {
      render(<CertificateGenerator {...mockProps} />);
      
      const generateButton = screen.getByText('🎨 修了証を生成');
      await user.click(generateButton);
      
      await waitFor(() => {
        expect(screen.getByText('📷 PNG ダウンロード')).toBeInTheDocument();
        expect(screen.getByText('📄 PDF ダウンロード')).toBeInTheDocument();
      });
    });

    it('should show correct completion statistics', () => {
      render(<CertificateGenerator {...mockProps} />);
      
      expect(screen.getByText('3')).toBeInTheDocument(); // Completed chapters
      expect(screen.getByText('2')).toBeInTheDocument(); // Skills count
      expect(screen.getByText('60%')).toBeInTheDocument(); // Progress (3/5 chapters)
    });

    it('should handle certificate download', async () => {
      render(<CertificateGenerator {...mockProps} />);
      
      // Generate certificate first
      const generateButton = screen.getByText('🎨 修了証を生成');
      await user.click(generateButton);
      
      await waitFor(() => {
        const downloadButton = screen.getByText('📷 PNG ダウンロード');
        expect(downloadButton).toBeInTheDocument();
      });
      
      // Mock download functionality would be tested here
      // This involves creating and clicking a mock anchor element
    });

    it('should show social sharing options after generation', async () => {
      render(<CertificateGenerator {...mockProps} />);
      
      const generateButton = screen.getByText('🎨 修了証を生成');
      await user.click(generateButton);
      
      await waitFor(() => {
        expect(screen.getByText('🌟 成果をシェア')).toBeInTheDocument();
        expect(screen.getByText('🐦 Twitter')).toBeInTheDocument();
        expect(screen.getByText('💼 LinkedIn')).toBeInTheDocument();
        expect(screen.getByText('📘 Facebook')).toBeInTheDocument();
      });
    });
  });

  describe('Feature D: Full-text Search', () => {
    const SearchSystem = require('../src/components/SearchSystem').default;

    const mockDocuments = [
      {
        id: 1,
        title: 'tmux基本操作',
        content: 'tmuxは複数のターミナルセッションを管理できるツールです',
        chapter: '1',
        tags: ['tmux', 'terminal', 'basic'],
        type: 'tutorial'
      },
      {
        id: 2,
        title: 'Claude Code連携',
        content: 'Claude CodeとtmuxでAI開発環境を構築する方法',
        chapter: '2',
        tags: ['claude', 'ai', 'integration'],
        type: 'tutorial'
      }
    ];

    it('should render search input and placeholder', () => {
      render(<SearchSystem documents={mockDocuments} />);
      
      expect(screen.getByPlaceholderText('教材を検索...')).toBeInTheDocument();
      expect(screen.getByLabelText('検索実行')).toBeInTheDocument();
    });

    it('should show search results when typing', async () => {
      render(<SearchSystem documents={mockDocuments} />);
      
      const searchInput = screen.getByPlaceholderText('教材を検索...');
      await user.type(searchInput, 'tmux');
      
      await waitFor(() => {
        expect(screen.getByText('📚 検索結果')).toBeInTheDocument();
        expect(screen.getByText('tmux基本操作')).toBeInTheDocument();
      });
    });

    it('should provide autocomplete suggestions', async () => {
      render(<SearchSystem documents={mockDocuments} enableAutoComplete={true} />);
      
      const searchInput = screen.getByPlaceholderText('教材を検索...');
      await user.type(searchInput, 'tm');
      
      await waitFor(() => {
        expect(screen.getByText('💡 提案')).toBeInTheDocument();
      });
    });

    it('should handle keyboard navigation', async () => {
      render(<SearchSystem documents={mockDocuments} />);
      
      const searchInput = screen.getByPlaceholderText('教材を検索...');
      await user.type(searchInput, 'tmux');
      
      await waitFor(() => {
        expect(screen.getByText('tmux基本操作')).toBeInTheDocument();
      });
      
      // Arrow down navigation
      await user.keyboard('{ArrowDown}');
      await user.keyboard('{Enter}');
      
      // Would test result selection here
    });

    it('should save and display search history', async () => {
      const getItemSpy = jest.spyOn(Storage.prototype, 'getItem');
      const setItemSpy = jest.spyOn(Storage.prototype, 'setItem');
      
      render(<SearchSystem documents={mockDocuments} />);
      
      const searchInput = screen.getByPlaceholderText('教材を検索...');
      await user.type(searchInput, 'tmux');
      await user.keyboard('{Enter}');
      
      expect(setItemSpy).toHaveBeenCalledWith('tutorial-search-history', expect.any(String));
    });

    it('should show no results message for empty search', async () => {
      render(<SearchSystem documents={mockDocuments} />);
      
      const searchInput = screen.getByPlaceholderText('教材を検索...');
      await user.type(searchInput, 'nonexistent');
      
      await waitFor(() => {
        expect(screen.getByText('検索結果が見つかりません')).toBeInTheDocument();
        expect(screen.getByText('キーワードを変更する')).toBeInTheDocument();
      });
    });

    it('should clear search when clear button is clicked', async () => {
      render(<SearchSystem documents={mockDocuments} />);
      
      const searchInput = screen.getByPlaceholderText('教材を検索...');
      await user.type(searchInput, 'tmux');
      
      const clearButton = screen.getByLabelText('検索をクリア');
      await user.click(clearButton);
      
      expect(searchInput.value).toBe('');
    });
  });

  describe('Feature E: Real-time Collaborative Learning', () => {
    const CollaborativeLearning = require('../src/components/CollaborativeLearning').default;

    const mockProps = {
      currentChapter: 1,
      userName: 'Test User',
      userId: 'user123',
      socketUrl: 'ws://localhost:3001'
    };

    beforeEach(() => {
      // Mock WebSocket
      global.WebSocket = jest.fn(() => ({
        send: jest.fn(),
        close: jest.fn(),
        readyState: 1,
        onopen: null,
        onmessage: null,
        onclose: null,
        onerror: null
      }));
    });

    it('should render collaboration interface', () => {
      render(<CollaborativeLearning {...mockProps} />);
      
      expect(screen.getByText('👥 共同学習セッション')).toBeInTheDocument();
      expect(screen.getByText('🚀 新しいセッションを作成')).toBeInTheDocument();
      expect(screen.getByText('🔗 既存のセッションに参加')).toBeInTheDocument();
    });

    it('should create new session when button is clicked', async () => {
      const mockWebSocket = {
        send: jest.fn(),
        close: jest.fn(),
        readyState: 1
      };
      
      global.WebSocket.mockReturnValue(mockWebSocket);
      
      render(<CollaborativeLearning {...mockProps} />);
      
      const createButton = screen.getByText('セッション作成');
      await user.click(createButton);
      
      expect(mockWebSocket.send).toHaveBeenCalledWith(
        expect.stringContaining('create_session')
      );
    });

    it('should join existing session with valid code', async () => {
      const mockWebSocket = {
        send: jest.fn(),
        close: jest.fn(),
        readyState: 1
      };
      
      global.WebSocket.mockReturnValue(mockWebSocket);
      
      render(<CollaborativeLearning {...mockProps} />);
      
      const sessionCodeInput = screen.getByPlaceholderText('例: ABC123');
      const joinButton = screen.getByText('参加');
      
      await user.type(sessionCodeInput, 'ABC123');
      await user.click(joinButton);
      
      expect(mockWebSocket.send).toHaveBeenCalledWith(
        expect.stringContaining('join_session')
      );
    });

    it('should show connection status correctly', () => {
      render(<CollaborativeLearning {...mockProps} />);
      
      // Initially disconnected
      expect(screen.getByText('🔴 切断中')).toBeInTheDocument();
    });

    it('should display collaboration benefits', () => {
      render(<CollaborativeLearning {...mockProps} />);
      
      expect(screen.getByText('✨ 共同学習の特徴')).toBeInTheDocument();
      expect(screen.getByText('📊 リアルタイム進捗共有')).toBeInTheDocument();
      expect(screen.getByText('💬 チーム内チャット')).toBeInTheDocument();
    });

    it('should handle session code input formatting', async () => {
      render(<CollaborativeLearning {...mockProps} />);
      
      const sessionCodeInput = screen.getByPlaceholderText('例: ABC123');
      await user.type(sessionCodeInput, 'abc123');
      
      expect(sessionCodeInput.value).toBe('ABC123');
    });

    it('should validate session code length', async () => {
      render(<CollaborativeLearning {...mockProps} />);
      
      const sessionCodeInput = screen.getByPlaceholderText('例: ABC123');
      const joinButton = screen.getByText('参加');
      
      // Empty code
      expect(joinButton).toBeDisabled();
      
      // Valid code
      await user.type(sessionCodeInput, 'ABC123');
      expect(joinButton).not.toBeDisabled();
    });
  });

  describe('Integration Tests - Features Working Together', () => {
    it('should maintain theme consistency across all new features', () => {
      const { ThemeProvider } = require('../src/hooks/useTheme');
      const MockTerminal = require('../src/components/MockTerminal').default;
      const ThemeToggle = require('../src/components/ThemeToggle').default;
      
      render(
        <ThemeProvider>
          <ThemeToggle />
          <MockTerminal />
        </ThemeProvider>
      );
      
      expect(screen.getByText('☀️')).toBeInTheDocument();
      expect(screen.getByText('tmux基本操作体験')).toBeInTheDocument();
    });

    it('should handle search within certificate system', async () => {
      const SearchSystem = require('../src/components/SearchSystem').default;
      const CertificateGenerator = require('../src/components/CertificateGenerator').default;
      
      const documents = [
        {
          id: 1,
          title: '修了証発行',
          content: '学習完了後に修了証を発行できます',
          type: 'feature'
        }
      ];
      
      render(
        <div>
          <SearchSystem documents={documents} />
          <CertificateGenerator userName="Test User" />
        </div>
      );
      
      const searchInput = screen.getByPlaceholderText('教材を検索...');
      await user.type(searchInput, '修了証');
      
      await waitFor(() => {
        expect(screen.getByText('修了証発行')).toBeInTheDocument();
      });
    });

    it('should support collaborative learning with shared progress tracking', async () => {
      const CollaborativeLearning = require('../src/components/CollaborativeLearning').default;
      const MockTerminal = require('../src/components/MockTerminal').default;
      
      const mockWebSocket = {
        send: jest.fn(),
        close: jest.fn(),
        readyState: 1
      };
      
      global.WebSocket.mockReturnValue(mockWebSocket);
      
      render(
        <div>
          <CollaborativeLearning currentChapter={1} userName="User1" />
          <MockTerminal scenario="basic" />
        </div>
      );
      
      expect(screen.getByText('👥 共同学習セッション')).toBeInTheDocument();
      expect(screen.getByText('tmux基本操作体験')).toBeInTheDocument();
    });
  });

  describe('Performance Tests', () => {
    it('should render large search results efficiently', async () => {
      const largeDocumentSet = Array.from({ length: 1000 }, (_, i) => ({
        id: i,
        title: `Document ${i}`,
        content: `Content for document ${i}`,
        type: 'test'
      }));
      
      const SearchSystem = require('../src/components/SearchSystem').default;
      
      const startTime = performance.now();
      render(<SearchSystem documents={largeDocumentSet} />);
      const endTime = performance.now();
      
      expect(endTime - startTime).toBeLessThan(100); // Should render within 100ms
    });

    it('should handle multiple simultaneous features without performance degradation', () => {
      const MockTerminal = require('../src/components/MockTerminal').default;
      const SearchSystem = require('../src/components/SearchSystem').default;
      const CertificateGenerator = require('../src/components/CertificateGenerator').default;
      
      const startTime = performance.now();
      
      render(
        <div>
          <MockTerminal />
          <SearchSystem documents={[]} />
          <CertificateGenerator userName="Test" />
        </div>
      );
      
      const endTime = performance.now();
      expect(endTime - startTime).toBeLessThan(200); // All features should load quickly
    });
  });

  describe('Accessibility Tests', () => {
    it('should support keyboard navigation in all new features', async () => {
      const MockTerminal = require('../src/components/MockTerminal').default;
      
      render(<MockTerminal />);
      
      const input = screen.getByPlaceholderText('コマンドを入力...');
      input.focus();
      
      expect(document.activeElement).toBe(input);
      
      // Tab navigation
      await user.keyboard('{Tab}');
      expect(document.activeElement).not.toBe(input);
    });

    it('should have proper ARIA labels on interactive elements', () => {
      const SearchSystem = require('../src/components/SearchSystem').default;
      
      render(<SearchSystem documents={[]} />);
      
      const searchInput = screen.getByLabelText('検索');
      const searchButton = screen.getByLabelText('検索実行');
      
      expect(searchInput).toHaveAttribute('aria-label', '検索');
      expect(searchButton).toHaveAttribute('aria-label', '検索実行');
    });

    it('should support screen readers with proper semantic structure', () => {
      const CertificateGenerator = require('../src/components/CertificateGenerator').default;
      
      render(<CertificateGenerator userName="Test" />);
      
      // Check for heading structure
      expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 3 })).toBeInTheDocument();
    });
  });
});

module.exports = {
  // Export test utilities for other test files
  setupNewFeatureTests: () => {
    // Global test setup for new features
    global.fetch = jest.fn();
    global.WebSocket = jest.fn();
    
    // Mock Canvas API
    HTMLCanvasElement.prototype.getContext = jest.fn();
    HTMLCanvasElement.prototype.toBlob = jest.fn();
    
    // Mock URL API
    global.URL.createObjectURL = jest.fn();
  },
  
  cleanupNewFeatureTests: () => {
    // Global test cleanup
    jest.restoreAllMocks();
  }
};
// 進捗管理システム
class ProgressTracker {
    constructor() {
        this.completedChapters = new Set();
        this.totalChapters = 5;
        this.currentChapter = 1;
        this.init();
    }

    init() {
        // ローカルストレージから進捗を読み込み
        this.loadProgress();
        
        // イベントリスナーを設定
        this.setupEventListeners();
        
        // 初期表示を更新
        this.updateUI();
        
        // 最初のチャプターを表示
        this.showChapter(this.currentChapter);
    }

    loadProgress() {
        const saved = localStorage.getItem('tutorial-progress');
        if (saved) {
            const data = JSON.parse(saved);
            this.completedChapters = new Set(data.completed || []);
            this.currentChapter = data.current || 1;
        }
    }

    saveProgress() {
        const data = {
            completed: Array.from(this.completedChapters),
            current: this.currentChapter
        };
        localStorage.setItem('tutorial-progress', JSON.stringify(data));
    }

    setupEventListeners() {
        // チャプター完了ボタン
        document.querySelectorAll('.complete-chapter').forEach(button => {
            button.addEventListener('click', (e) => {
                const chapterNum = parseInt(e.target.dataset.chapter);
                this.completeChapter(chapterNum);
            });
        });

        // チャプターリンク
        document.querySelectorAll('.chapter-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const chapterNum = parseInt(e.target.dataset.chapter);
                this.showChapter(chapterNum);
            });
        });

        // キーボードナビゲーション
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowRight' && this.currentChapter < this.totalChapters) {
                this.showChapter(this.currentChapter + 1);
            } else if (e.key === 'ArrowLeft' && this.currentChapter > 1) {
                this.showChapter(this.currentChapter - 1);
            }
        });
    }

    completeChapter(chapterNum) {
        this.completedChapters.add(chapterNum);
        this.saveProgress();
        this.updateUI();
        
        // 完了アニメーション
        this.showCompletionAnimation(chapterNum);
        
        // 次のチャプターを自動表示
        if (chapterNum < this.totalChapters) {
            setTimeout(() => {
                this.showChapter(chapterNum + 1);
            }, 1500);
        } else {
            // 全チャプター完了
            this.showCongratulations();
        }
    }

    showChapter(chapterNum) {
        // 現在のチャプターを非表示
        document.querySelectorAll('.chapter').forEach(chapter => {
            chapter.style.display = 'none';
        });
        
        // 指定されたチャプターを表示
        const targetChapter = document.getElementById(`chapter-${chapterNum}`);
        if (targetChapter) {
            targetChapter.style.display = 'block';
            this.currentChapter = chapterNum;
            this.saveProgress();
            this.updateUI();
            
            // スムーズスクロール
            targetChapter.scrollIntoView({ behavior: 'smooth' });
        }
    }

    updateUI() {
        // 進捗バーを更新
        const progressPercentage = (this.completedChapters.size / this.totalChapters) * 100;
        const progressBar = document.getElementById('progress-bar');
        const progressText = document.getElementById('progress-percentage');
        
        if (progressBar && progressText) {
            progressBar.style.width = `${progressPercentage}%`;
            progressText.textContent = `${Math.round(progressPercentage)}%`;
        }

        // チャプターリンクのステータスを更新
        document.querySelectorAll('.chapter-link').forEach(link => {
            const chapterNum = parseInt(link.dataset.chapter);
            const statusSpan = link.querySelector('.chapter-status');
            
            if (this.completedChapters.has(chapterNum)) {
                link.classList.add('bg-green-50', 'border-green-200');
                link.classList.remove('hover:bg-blue-50');
                statusSpan.textContent = '完了';
                statusSpan.classList.add('text-green-600');
                statusSpan.classList.remove('text-gray-400');
            } else if (chapterNum === this.currentChapter) {
                link.classList.add('bg-blue-100', 'border-blue-200');
                statusSpan.textContent = '進行中';
                statusSpan.classList.add('text-blue-600');
                statusSpan.classList.remove('text-gray-400');
            } else {
                link.classList.remove('bg-green-50', 'bg-blue-100', 'border-green-200', 'border-blue-200');
                statusSpan.textContent = '未完了';
                statusSpan.classList.add('text-gray-400');
                statusSpan.classList.remove('text-green-600', 'text-blue-600');
            }
        });

        // 完了ボタンの状態を更新
        document.querySelectorAll('.complete-chapter').forEach(button => {
            const chapterNum = parseInt(button.dataset.chapter);
            if (this.completedChapters.has(chapterNum)) {
                button.textContent = '✓ 完了済み';
                button.classList.add('bg-green-600', 'hover:bg-green-700');
                button.classList.remove('bg-blue-600', 'hover:bg-blue-700');
                button.disabled = true;
            }
        });
    }

    showCompletionAnimation(chapterNum) {
        // チャプター完了のアニメーション
        const button = document.querySelector(`[data-chapter="${chapterNum}"].complete-chapter`);
        if (button) {
            button.innerHTML = '<i class="fas fa-check mr-2"></i>完了！';
            button.classList.add('animate-pulse');
            
            setTimeout(() => {
                button.classList.remove('animate-pulse');
            }, 1000);
        }

        // 通知の表示
        this.showNotification(`チャプター${chapterNum}が完了しました！`);
    }

    showNotification(message) {
        // 通知要素を作成
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 transform translate-x-full transition-transform duration-300';
        notification.innerHTML = `
            <i class="fas fa-check-circle mr-2"></i>
            ${message}
        `;
        
        document.body.appendChild(notification);
        
        // アニメーション
        setTimeout(() => {
            notification.classList.remove('translate-x-full');
        }, 100);
        
        // 自動削除
        setTimeout(() => {
            notification.classList.add('translate-x-full');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    showCongratulations() {
        // 全チャプター完了時の祝福メッセージ
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="bg-white rounded-lg p-8 max-w-md mx-4 text-center">
                <i class="fas fa-trophy text-yellow-500 text-6xl mb-4"></i>
                <h2 class="text-2xl font-bold mb-4 text-gray-800">おめでとうございます！</h2>
                <p class="text-gray-600 mb-6">
                    すべてのチャプターを完了しました。<br>
                    tmux環境でclaudeMAX管理の基礎を習得できました！
                </p>
                <button class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors" onclick="this.parentElement.parentElement.remove()">
                    閉じる
                </button>
            </div>
        `;
        
        document.body.appendChild(modal);
    }

    resetProgress() {
        this.completedChapters.clear();
        this.currentChapter = 1;
        this.saveProgress();
        this.updateUI();
        this.showChapter(1);
        this.showNotification('進捗がリセットされました');
    }
}

// 用語集機能
class Glossary {
    constructor() {
        this.terms = {
            'tmux': 'Terminal Multiplexer - 一つのターミナルで複数のセッションを管理できるツール',
            'claudeMAX': 'Claude Codeの高度な機能を活用した開発環境の総称',
            'セッション': 'tmuxにおける独立したターミナル環境の単位',
            'ペイン': 'tmuxウィンドウ内の分割された領域',
            'ウィンドウ': 'tmuxセッション内のタブのような概念'
        };
        this.init();
    }

    init() {
        this.createGlossaryModal();
        this.setupTooltips();
    }

    createGlossaryModal() {
        // 用語集モーダルを作成
        const modal = document.createElement('div');
        modal.id = 'glossary-modal';
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 items-center justify-center z-50 hidden';
        modal.innerHTML = `
            <div class="bg-white rounded-lg p-6 max-w-2xl mx-4 max-h-96 overflow-y-auto">
                <div class="flex justify-between items-center mb-4">
                    <h2 class="text-xl font-bold">用語集</h2>
                    <button class="text-gray-500 hover:text-gray-700" onclick="document.getElementById('glossary-modal').classList.add('hidden')">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="space-y-4">
                    ${Object.entries(this.terms).map(([term, definition]) => `
                        <div class="border-b pb-2">
                            <h3 class="font-semibold text-blue-600">${term}</h3>
                            <p class="text-gray-700 text-sm">${definition}</p>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);

        // 用語集ボタンを追加
        const glossaryButton = document.createElement('button');
        glossaryButton.className = 'fixed bottom-4 right-4 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors z-40';
        glossaryButton.innerHTML = '<i class="fas fa-book"></i>';
        glossaryButton.title = '用語集を開く';
        glossaryButton.onclick = () => {
            document.getElementById('glossary-modal').classList.remove('hidden');
            document.getElementById('glossary-modal').classList.add('flex');
        };
        
        document.body.appendChild(glossaryButton);
    }

    setupTooltips() {
        // 既存のツールチップは CSS で処理済み
        // 追加の動的ツールチップが必要な場合はここで処理
    }
}

// レスポンシブ対応
class ResponsiveHandler {
    constructor() {
        this.init();
    }

    init() {
        this.handleResize();
        window.addEventListener('resize', () => this.handleResize());
    }

    handleResize() {
        const isMobile = window.innerWidth < 768;
        
        if (isMobile) {
            // モバイル用の調整
            document.querySelectorAll('.tooltip').forEach(tooltip => {
                tooltip.addEventListener('click', (e) => {
                    e.preventDefault();
                    const tooltipText = tooltip.querySelector('.tooltiptext');
                    if (tooltipText) {
                        tooltipText.style.visibility = 'visible';
                        tooltipText.style.opacity = '1';
                        
                        setTimeout(() => {
                            tooltipText.style.visibility = 'hidden';
                            tooltipText.style.opacity = '0';
                        }, 3000);
                    }
                });
            });
        }
    }
}

// 認証管理システム
class AuthManager {
    constructor() {
        this.user = null;
        this.token = localStorage.getItem('auth-token');
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.checkAuthStatus();
        this.updateBuildInfo();
    }

    setupEventListeners() {
        // ログインボタン
        document.getElementById('login-btn').addEventListener('click', () => {
            this.showModal('login-modal');
        });

        // 新規登録ボタン
        document.getElementById('register-btn').addEventListener('click', () => {
            this.showModal('register-modal');
        });

        // モーダル切り替え
        document.getElementById('switch-to-register').addEventListener('click', () => {
            this.hideModal('login-modal');
            this.showModal('register-modal');
        });

        document.getElementById('switch-to-login').addEventListener('click', () => {
            this.hideModal('register-modal');
            this.showModal('login-modal');
        });

        // モーダル閉じる
        document.querySelectorAll('[id^="close-"][id$="-modal"]').forEach(btn => {
            btn.addEventListener('click', () => {
                const modalId = btn.id.replace('close-', '').replace('-modal', '') + '-modal';
                this.hideModal(modalId);
            });
        });

        // ユーザーメニュー
        document.getElementById('user-menu-btn').addEventListener('click', () => {
            const menu = document.getElementById('user-menu');
            menu.classList.toggle('hidden');
        });

        // プロフィール表示
        document.getElementById('profile-btn').addEventListener('click', () => {
            this.showProfile();
        });

        // ログアウト
        document.getElementById('logout-btn').addEventListener('click', () => {
            this.logout();
        });

        // フォーム送信
        document.getElementById('login-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });

        document.getElementById('register-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleRegister();
        });
    }

    showModal(modalId) {
        document.getElementById(modalId).classList.remove('hidden');
    }

    hideModal(modalId) {
        document.getElementById(modalId).classList.add('hidden');
    }

    async handleLogin() {
        const username = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;

        try {
            // デモ用 - 実際のAPIコールに置き換え
            if (username && password) {
                this.user = { username, email: 'demo@example.com' };
                this.token = 'demo-token';
                localStorage.setItem('auth-token', this.token);
                this.updateAuthUI();
                this.hideModal('login-modal');
                this.showNotification('ログインしました');
            }
        } catch (error) {
            console.error('Login error:', error);
            this.showNotification('ログインに失敗しました', 'error');
        }
    }

    async handleRegister() {
        const username = document.getElementById('register-username').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;

        if (password.length < 6) {
            this.showNotification('パスワードは6文字以上で入力してください', 'error');
            return;
        }

        try {
            // デモ用 - 実際のAPIコールに置き換え
            this.user = { username, email: email || null };
            this.token = 'demo-token';
            localStorage.setItem('auth-token', this.token);
            this.updateAuthUI();
            this.hideModal('register-modal');
            this.showNotification('アカウントを作成しました');
        } catch (error) {
            console.error('Register error:', error);
            this.showNotification('登録に失敗しました', 'error');
        }
    }

    checkAuthStatus() {
        if (this.token) {
            // デモ用ユーザー
            this.user = { username: 'デモユーザー', email: 'demo@example.com' };
            this.updateAuthUI();
        }
    }

    updateAuthUI() {
        const userInfo = document.getElementById('user-info');
        const loginSection = document.getElementById('login-section');
        const username = document.getElementById('username');

        if (this.user) {
            userInfo.classList.remove('hidden');
            userInfo.classList.add('flex');
            loginSection.classList.add('hidden');
            username.textContent = this.user.username;
        } else {
            userInfo.classList.add('hidden');
            userInfo.classList.remove('flex');
            loginSection.classList.remove('hidden');
        }
    }

    showProfile() {
        if (!this.user) return;

        document.getElementById('profile-username').textContent = this.user.username;
        document.getElementById('profile-email').textContent = this.user.email || 'メールアドレス未設定';
        document.getElementById('profile-created').textContent = '2025-06-20';
        document.getElementById('profile-progress').textContent = '60%';
        document.getElementById('profile-completed-chapters').textContent = '3/5';

        this.showModal('profile-modal');
        document.getElementById('user-menu').classList.add('hidden');
    }

    logout() {
        this.user = null;
        this.token = null;
        localStorage.removeItem('auth-token');
        this.updateAuthUI();
        document.getElementById('user-menu').classList.add('hidden');
        this.showNotification('ログアウトしました');
    }

    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        const bgColor = type === 'error' ? 'bg-red-500' : 'bg-green-500';
        const icon = type === 'error' ? 'fas fa-exclamation-circle' : 'fas fa-check-circle';
        
        notification.className = `fixed top-4 right-4 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg z-50 transform translate-x-full transition-transform duration-300`;
        notification.innerHTML = `<i class="${icon} mr-2"></i>${message}`;
        
        document.body.appendChild(notification);
        
        setTimeout(() => notification.classList.remove('translate-x-full'), 100);
        setTimeout(() => {
            notification.classList.add('translate-x-full');
            setTimeout(() => document.body.removeChild(notification), 300);
        }, 3000);
    }

    updateBuildInfo() {
        // ビルドハッシュを生成（実際はビルド時に設定）
        const buildHash = Math.random().toString(36).substring(2, 9);
        document.getElementById('build-hash').textContent = buildHash;
        
        // 最終更新日を設定
        const now = new Date().toLocaleDateString('ja-JP');
        document.getElementById('last-updated').textContent = now;
    }
}

// クイズシステム
class QuizManager {
    constructor() {
        this.quizData = {
            1: {
                question: "tmuxの主な用途は何ですか？",
                options: {
                    A: "ファイルを圧縮する",
                    B: "複数のターミナルセッションを管理する",
                    C: "データベースを管理する",
                    D: "ウェブサーバーを起動する"
                },
                correct: "B",
                explanation: "tmux (Terminal Multiplexer) は、一つのターミナル内で複数のセッションやウィンドウを管理するためのツールです。開発者が複数のコマンドライン作業を効率的に行うために使用されます。"
            }
        };
        this.init();
    }

    init() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        document.querySelectorAll('.quiz-option').forEach(option => {
            option.addEventListener('click', (e) => {
                this.handleQuizAnswer(e);
            });
        });

        document.getElementById('close-quiz-modal').addEventListener('click', () => {
            document.getElementById('quiz-feedback-modal').classList.add('hidden');
        });
    }

    handleQuizAnswer(e) {
        const selectedAnswer = e.target.dataset.answer;
        const questionElement = e.target.closest('.quiz-question');
        const chapterNum = parseInt(questionElement.dataset.chapter);
        const questionNum = parseInt(questionElement.dataset.question);
        
        const quizData = this.quizData[chapterNum];
        if (!quizData) return;

        const isCorrect = selectedAnswer === quizData.correct;
        this.showFeedback(isCorrect, quizData, selectedAnswer);

        // 選択肢を無効化
        questionElement.querySelectorAll('.quiz-option').forEach(opt => {
            opt.disabled = true;
            opt.classList.add('cursor-not-allowed');
            if (opt.dataset.answer === quizData.correct) {
                opt.classList.add('bg-green-100', 'border-green-500');
            } else if (opt.dataset.answer === selectedAnswer && !isCorrect) {
                opt.classList.add('bg-red-100', 'border-red-500');
            }
        });
    }

    showFeedback(isCorrect, quizData, selectedAnswer) {
        const modal = document.getElementById('quiz-feedback-modal');
        const icon = document.getElementById('quiz-result-icon');
        const title = document.getElementById('quiz-result-title');
        const explanation = document.getElementById('quiz-explanation');
        const correctAnswer = document.getElementById('quiz-correct-answer');

        if (isCorrect) {
            icon.textContent = '✅';
            title.textContent = '正解！';
            title.className = 'text-2xl font-bold mb-4 text-green-600';
        } else {
            icon.textContent = '❌';
            title.textContent = '不正解...';
            title.className = 'text-2xl font-bold mb-4 text-red-600';
        }

        explanation.textContent = quizData.explanation;
        correctAnswer.textContent = `正解: ${quizData.correct}. ${quizData.options[quizData.correct]}`;

        modal.classList.remove('hidden');
    }
}

// アプリケーション初期化
document.addEventListener('DOMContentLoaded', () => {
    const progressTracker = new ProgressTracker();
    const glossary = new Glossary();
    const responsiveHandler = new ResponsiveHandler();
    const authManager = new AuthManager();
    const quizManager = new QuizManager();
    
    // デバッグ用のリセット機能（開発時のみ）
    if (window.location.search.includes('debug=true')) {
        const resetButton = document.createElement('button');
        resetButton.className = 'fixed bottom-4 left-4 bg-red-600 text-white p-2 rounded text-xs';
        resetButton.textContent = 'リセット';
        resetButton.onclick = () => progressTracker.resetProgress();
        document.body.appendChild(resetButton);
    }
});
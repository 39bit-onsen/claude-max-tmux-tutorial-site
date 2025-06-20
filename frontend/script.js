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

// アプリケーション初期化
document.addEventListener('DOMContentLoaded', () => {
    const progressTracker = new ProgressTracker();
    const glossary = new Glossary();
    const responsiveHandler = new ResponsiveHandler();
    
    // デバッグ用のリセット機能（開発時のみ）
    if (window.location.search.includes('debug=true')) {
        const resetButton = document.createElement('button');
        resetButton.className = 'fixed bottom-4 left-4 bg-red-600 text-white p-2 rounded text-xs';
        resetButton.textContent = 'リセット';
        resetButton.onclick = () => progressTracker.resetProgress();
        document.body.appendChild(resetButton);
    }
});
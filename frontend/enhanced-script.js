// 拡張進捗管理システム
class EnhancedProgressTracker {
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
        
        // 進捗ドットを生成
        this.createProgressDots();
    }

    loadProgress() {
        const saved = localStorage.getItem('tutorial-progress');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                this.completedChapters = new Set(data.completed || []);
                this.currentChapter = data.current || 1;
            } catch (e) {
                console.warn('進捗データの読み込みに失敗しました:', e);
                this.resetProgress();
            }
        }
    }

    saveProgress() {
        const data = {
            completed: Array.from(this.completedChapters),
            current: this.currentChapter,
            lastUpdate: new Date().toISOString()
        };
        localStorage.setItem('tutorial-progress', JSON.stringify(data));
    }

    createProgressDots() {
        const dotsContainer = document.getElementById('progress-dots');
        if (!dotsContainer) return;

        dotsContainer.innerHTML = '';
        
        for (let i = 1; i <= this.totalChapters; i++) {
            const dot = document.createElement('div');
            dot.className = 'chapter-dot';
            dot.setAttribute('data-chapter', i);
            dot.setAttribute('aria-label', `チャプター${i}`);
            dot.setAttribute('title', `チャプター${i}`);
            dotsContainer.appendChild(dot);
        }
    }

    setupEventListeners() {
        // チャプター完了ボタン
        document.querySelectorAll('.complete-chapter').forEach(button => {
            button.addEventListener('click', (e) => {
                const chapterNum = parseInt(e.target.dataset.chapter);
                this.completeChapter(chapterNum);
            });
        });

        // チャプターリンク（サイドバー・ドロワー共通）
        document.querySelectorAll('.chapter-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const chapterNum = parseInt(e.target.closest('[data-chapter]').dataset.chapter);
                this.showChapter(chapterNum);
                
                // ドロワーが開いている場合は閉じる
                this.closeDrawer();
            });
        });

        // モバイルメニューボタン
        const mobileMenuBtn = document.getElementById('mobile-menu-btn');
        if (mobileMenuBtn) {
            mobileMenuBtn.addEventListener('click', () => {
                this.openDrawer();
            });
        }

        // ドロワー閉じるボタン
        const closeDrawerBtn = document.getElementById('close-drawer-btn');
        if (closeDrawerBtn) {
            closeDrawerBtn.addEventListener('click', () => {
                this.closeDrawer();
            });
        }

        // ドロワーオーバーレイクリック
        const drawerOverlay = document.getElementById('drawer-overlay');
        if (drawerOverlay) {
            drawerOverlay.addEventListener('click', () => {
                this.closeDrawer();
            });
        }

        // キーボードナビゲーション（アクセシビリティ強化）
        document.addEventListener('keydown', (e) => {
            // Escキーでドロワーを閉じる
            if (e.key === 'Escape') {
                this.closeDrawer();
            }
            
            // Alt + 矢印キーでチャプター移動
            if (e.altKey) {
                if (e.key === 'ArrowRight' && this.currentChapter < this.totalChapters) {
                    e.preventDefault();
                    this.showChapter(this.currentChapter + 1);
                } else if (e.key === 'ArrowLeft' && this.currentChapter > 1) {
                    e.preventDefault();
                    this.showChapter(this.currentChapter - 1);
                }
            }
        });

        // ツールチップのキーボード対応
        document.querySelectorAll('.tooltip [tabindex="0"]').forEach(trigger => {
            trigger.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    const tooltip = trigger.nextElementSibling;
                    if (tooltip && tooltip.classList.contains('tooltiptext')) {
                        tooltip.style.visibility = 'visible';
                        tooltip.style.opacity = '1';
                        
                        // 3秒後に自動で閉じる
                        setTimeout(() => {
                            tooltip.style.visibility = 'hidden';
                            tooltip.style.opacity = '0';
                        }, 3000);
                    }
                }
            });
        });
    }

    openDrawer() {
        const drawer = document.getElementById('drawer');
        const overlay = document.getElementById('drawer-overlay');
        
        if (drawer && overlay) {
            drawer.classList.add('show');
            overlay.classList.add('show');
            drawer.setAttribute('aria-hidden', 'false');
            overlay.setAttribute('aria-hidden', 'false');
            
            // フォーカス管理
            const firstFocusable = drawer.querySelector('button, a, [tabindex="0"]');
            if (firstFocusable) {
                firstFocusable.focus();
            }
        }
    }

    closeDrawer() {
        const drawer = document.getElementById('drawer');
        const overlay = document.getElementById('drawer-overlay');
        
        if (drawer && overlay) {
            drawer.classList.remove('show');
            overlay.classList.remove('show');
            drawer.setAttribute('aria-hidden', 'true');
            overlay.setAttribute('aria-hidden', 'true');
        }
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
            
            // フォーカス管理（アクセシビリティ）
            const heading = targetChapter.querySelector('h2');
            if (heading) {
                heading.focus();
            }
        }
    }

    updateUI() {
        // 進捗バーを更新
        const progressPercentage = (this.completedChapters.size / this.totalChapters) * 100;
        const progressBar = document.getElementById('progress-bar');
        const progressText = document.getElementById('progress-percentage');
        const progressBarElement = progressBar?.parentElement;
        
        if (progressBar && progressText) {
            progressBar.style.width = `${progressPercentage}%`;
            progressText.textContent = `${Math.round(progressPercentage)}%`;
            
            // プログレスバーのaria属性を更新
            if (progressBarElement) {
                progressBarElement.setAttribute('aria-valuenow', Math.round(progressPercentage));
            }
        }

        // 進捗ドットを更新
        document.querySelectorAll('.chapter-dot').forEach(dot => {
            const chapterNum = parseInt(dot.dataset.chapter);
            dot.classList.remove('completed', 'current');
            
            if (this.completedChapters.has(chapterNum)) {
                dot.classList.add('completed');
            } else if (chapterNum === this.currentChapter) {
                dot.classList.add('current');
            }
        });

        // チャプターリンクのステータスを更新
        document.querySelectorAll('.chapter-link').forEach(link => {
            const chapterNum = parseInt(link.dataset.chapter);
            const statusSpan = link.querySelector('.chapter-status');
            
            // クラスをリセット
            link.classList.remove('bg-green-50', 'bg-blue-100', 'border-green-200', 'border-blue-200');
            
            if (this.completedChapters.has(chapterNum)) {
                link.classList.add('bg-green-50', 'border-green-200');
                if (statusSpan) {
                    statusSpan.textContent = '完了';
                    statusSpan.classList.add('text-green-600');
                    statusSpan.classList.remove('text-gray-400', 'text-blue-600');
                }
                link.setAttribute('aria-describedby', `chapter-${chapterNum}-completed`);
            } else if (chapterNum === this.currentChapter) {
                link.classList.add('bg-blue-100', 'border-blue-200');
                if (statusSpan) {
                    statusSpan.textContent = '進行中';
                    statusSpan.classList.add('text-blue-600');
                    statusSpan.classList.remove('text-gray-400', 'text-green-600');
                }
                link.setAttribute('aria-current', 'page');
            } else {
                if (statusSpan) {
                    statusSpan.textContent = '未完了';
                    statusSpan.classList.add('text-gray-400');
                    statusSpan.classList.remove('text-green-600', 'text-blue-600');
                }
                link.removeAttribute('aria-current');
                link.removeAttribute('aria-describedby');
            }
        });

        // 完了ボタンの状態を更新
        document.querySelectorAll('.complete-chapter').forEach(button => {
            const chapterNum = parseInt(button.dataset.chapter);
            if (this.completedChapters.has(chapterNum)) {
                button.innerHTML = '<i class="fas fa-check mr-2" aria-hidden="true"></i>完了済み';
                button.classList.add('bg-green-600', 'hover:bg-green-700');
                button.classList.remove('bg-blue-600', 'hover:bg-blue-700');
                button.disabled = true;
                button.setAttribute('aria-pressed', 'true');
            }
        });
    }

    showCompletionAnimation(chapterNum) {
        // チャプター完了のアニメーション
        const button = document.querySelector(`[data-chapter="${chapterNum}"].complete-chapter`);
        if (button) {
            button.innerHTML = '<i class="fas fa-check mr-2" aria-hidden="true"></i>完了！';
            button.classList.add('animate-pulse');
            
            setTimeout(() => {
                button.classList.remove('animate-pulse');
            }, 1000);
        }

        // 通知の表示
        this.showNotification(`チャプター${chapterNum}が完了しました！`);
    }

    showNotification(message, type = 'success') {
        // 通知要素を作成
        const notification = document.createElement('div');
        const bgColor = type === 'error' ? 'bg-red-500' : 'bg-green-500';
        const icon = type === 'error' ? 'fas fa-exclamation-circle' : 'fas fa-check-circle';
        
        notification.className = `fixed top-4 right-4 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg z-50 transform translate-x-full transition-transform duration-300`;
        notification.setAttribute('role', 'alert');
        notification.setAttribute('aria-live', 'polite');
        notification.innerHTML = `
            <i class="${icon} mr-2" aria-hidden="true"></i>
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
                if (notification.parentNode) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    showCongratulations() {
        // 全チャプター完了時の祝福メッセージ
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-labelledby', 'congratulations-title');
        modal.innerHTML = `
            <div class="bg-white rounded-lg p-8 max-w-md mx-4 text-center">
                <i class="fas fa-trophy text-yellow-500 text-6xl mb-4" aria-hidden="true"></i>
                <h2 id="congratulations-title" class="text-2xl font-bold mb-4 text-gray-800">おめでとうございます！</h2>
                <p class="text-gray-600 mb-6">
                    すべてのチャプターを完了しました。<br>
                    tmux環境でclaudeMAX管理の基礎を習得できました！
                </p>
                <button class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2" onclick="this.parentElement.parentElement.remove()">
                    閉じる
                </button>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // フォーカス管理
        const closeButton = modal.querySelector('button');
        if (closeButton) {
            closeButton.focus();
        }
    }

    resetProgress() {
        this.completedChapters.clear();
        this.currentChapter = 1;
        localStorage.removeItem('tutorial-progress');
        this.updateUI();
        this.showChapter(1);
        this.showNotification('進捗がリセットされました');
    }
}

// 拡張用語集機能
class EnhancedGlossary {
    constructor() {
        this.terms = {
            'tmux': 'Terminal Multiplexer - 一つのターミナルで複数のセッションを管理できるツール。セッション、ウィンドウ、ペインの階層構造を持ちます。',
            'claudeMAX': 'Claude Codeの高度な機能を活用した開発環境の総称。AI支援による効率的なコーディングが可能です。',
            'セッション': 'tmuxにおける独立したターミナル環境の単位。複数のウィンドウを含むことができ、デタッチ・アタッチが可能です。',
            'ペイン': 'tmuxウィンドウ内の分割された領域。個別のターミナルセッションを実行できます。',
            'ウィンドウ': 'tmuxセッション内のタブのような概念。複数のペインに分割可能です。',
            '自動化スクリプト': '開発環境の起動、設定、プロジェクト準備を自動化するスクリプト群です。',
            '複数プロジェクト管理': '複数のプロジェクトを効率的に切り替えながら開発するためのワークフロー管理手法です。',
            'カスタマイズ': '個人の開発スタイルに合わせたtmux設定とClaudeCode連携の最適化です。'
        };
        this.init();
    }

    init() {
        this.createGlossaryModal();
    }

    createGlossaryModal() {
        // 用語集モーダルを作成
        const modal = document.createElement('div');
        modal.id = 'glossary-modal';
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 items-center justify-center z-50 hidden';
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-labelledby', 'glossary-title');
        modal.innerHTML = `
            <div class="bg-white rounded-lg p-6 max-w-2xl mx-4 max-h-96 overflow-y-auto">
                <div class="flex justify-between items-center mb-4">
                    <h2 id="glossary-title" class="text-xl font-bold">用語集</h2>
                    <button class="text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded" onclick="document.getElementById('glossary-modal').classList.add('hidden')" aria-label="用語集を閉じる">
                        <i class="fas fa-times" aria-hidden="true"></i>
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
        glossaryButton.className = 'fixed bottom-4 right-4 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors z-40 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2';
        glossaryButton.innerHTML = '<i class="fas fa-book" aria-hidden="true"></i>';
        glossaryButton.setAttribute('aria-label', '用語集を開く');
        glossaryButton.onclick = () => {
            document.getElementById('glossary-modal').classList.remove('hidden');
            document.getElementById('glossary-modal').classList.add('flex');
        };
        
        document.body.appendChild(glossaryButton);
    }
}

// レスポンシブ対応強化
class EnhancedResponsiveHandler {
    constructor() {
        this.init();
    }

    init() {
        this.handleResize();
        window.addEventListener('resize', () => this.handleResize());
        this.setupTouchSupport();
    }

    handleResize() {
        const isMobile = window.innerWidth < 768;
        const isTablet = window.innerWidth >= 768 && window.innerWidth < 1024;
        
        if (isMobile) {
            // モバイル用の調整
            this.setupMobileTooltips();
            this.adjustMobileLayout();
        } else if (isTablet) {
            // タブレット用の調整
            this.adjustTabletLayout();
        }
    }

    setupMobileTooltips() {
        // モバイルでのツールチップをタップ対応に
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
                    }, 4000);
                }
            });
        });
    }

    setupTouchSupport() {
        // スワイプジェスチャーでチャプター移動
        let startX = null;
        let startY = null;
        
        document.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        });
        
        document.addEventListener('touchmove', (e) => {
            if (!startX || !startY) return;
            
            const currentX = e.touches[0].clientX;
            const currentY = e.touches[0].clientY;
            
            const diffX = startX - currentX;
            const diffY = startY - currentY;
            
            // 横方向のスワイプを優先
            if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
                const progressTracker = window.progressTracker;
                if (progressTracker) {
                    if (diffX > 0 && progressTracker.currentChapter < progressTracker.totalChapters) {
                        // 左スワイプ: 次のチャプター
                        progressTracker.showChapter(progressTracker.currentChapter + 1);
                    } else if (diffX < 0 && progressTracker.currentChapter > 1) {
                        // 右スワイプ: 前のチャプター
                        progressTracker.showChapter(progressTracker.currentChapter - 1);
                    }
                }
                startX = null;
                startY = null;
            }
        });
    }

    adjustMobileLayout() {
        // モバイルレイアウトの調整
        const mainContent = document.querySelector('main');
        if (mainContent) {
            mainContent.style.paddingTop = '1rem';
        }
    }

    adjustTabletLayout() {
        // タブレットレイアウトの調整
        const container = document.querySelector('.container');
        if (container) {
            container.style.paddingLeft = '2rem';
            container.style.paddingRight = '2rem';
        }
    }
}

// アプリケーション初期化
document.addEventListener('DOMContentLoaded', () => {
    const progressTracker = new EnhancedProgressTracker();
    const glossary = new EnhancedGlossary();
    const responsiveHandler = new EnhancedResponsiveHandler();
    
    // グローバルアクセス用
    window.progressTracker = progressTracker;
    
    // デバッグ用のリセット機能（開発時のみ）
    if (window.location.search.includes('debug=true')) {
        const resetButton = document.createElement('button');
        resetButton.className = 'fixed bottom-16 left-4 bg-red-600 text-white p-2 rounded text-xs focus:outline-none focus:ring-2 focus:ring-red-500';
        resetButton.textContent = 'リセット';
        resetButton.onclick = () => progressTracker.resetProgress();
        resetButton.setAttribute('aria-label', '進捗をリセット');
        document.body.appendChild(resetButton);
    }
    
    // パフォーマンス監視（開発用）
    if (window.location.search.includes('perf=true')) {
        console.log('Performance monitoring enabled');
        
        // ページロード時間を計測
        window.addEventListener('load', () => {
            const loadTime = performance.now();
            console.log(`Page loaded in ${loadTime.toFixed(2)}ms`);
        });
    }
});
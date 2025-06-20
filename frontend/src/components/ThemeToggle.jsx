import React, { useState } from 'react';
import { useTheme } from '../hooks/useTheme';
import './ThemeToggle.css';

const ThemeToggle = ({ size = 'medium', showLabel = true, position = 'inline' }) => {
  const { theme, toggleTheme, isLight, isDark } = useTheme();
  const [isAnimating, setIsAnimating] = useState(false);

  const handleToggle = () => {
    setIsAnimating(true);
    toggleTheme();
    
    // アニメーション終了後にフラグをリセット
    setTimeout(() => setIsAnimating(false), 300);
  };

  const getToggleClasses = () => {
    const classes = ['theme-toggle'];
    
    classes.push(`theme-toggle--${size}`);
    classes.push(`theme-toggle--${position}`);
    
    if (isDark) classes.push('theme-toggle--dark');
    if (isAnimating) classes.push('theme-toggle--animating');
    
    return classes.join(' ');
  };

  return (
    <div className={getToggleClasses()}>
      <button
        className="theme-toggle__button"
        onClick={handleToggle}
        aria-label={`テーマを${isLight ? 'ダーク' : 'ライト'}モードに切り替え`}
        title={`現在: ${isLight ? 'ライト' : 'ダーク'}モード`}
      >
        <div className="theme-toggle__track">
          <div className="theme-toggle__thumb">
            <span className="theme-toggle__icon">
              {isLight ? '☀️' : '🌙'}
            </span>
          </div>
          
          {/* 背景アイコン */}
          <div className="theme-toggle__background-icons">
            <span className="theme-toggle__sun">☀️</span>
            <span className="theme-toggle__moon">🌙</span>
          </div>
        </div>
        
        {showLabel && (
          <span className="theme-toggle__label">
            {isLight ? 'ライトモード' : 'ダークモード'}
          </span>
        )}
      </button>
      
      {/* キーボードショートカット表示 */}
      <div className="theme-toggle__shortcut" aria-hidden="true">
        Ctrl + Shift + T
      </div>
    </div>
  );
};

// フローティング用のテーマトグル
export const FloatingThemeToggle = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="floating-theme-toggle">
      <ThemeToggle 
        size="large" 
        showLabel={isExpanded}
        position="floating"
      />
      
      <button
        className="floating-theme-toggle__expand"
        onClick={() => setIsExpanded(!isExpanded)}
        aria-label="テーマ設定を展開"
      >
        ⚙️
      </button>
    </div>
  );
};

// ヘッダー用のコンパクトテーマトグル
export const HeaderThemeToggle = () => {
  return (
    <ThemeToggle 
      size="small" 
      showLabel={false}
      position="header"
    />
  );
};

// 設定パネル用の詳細テーマトグル
export const SettingsThemeToggle = () => {
  const { theme, setLightTheme, setDarkTheme } = useTheme();

  return (
    <div className="settings-theme-toggle">
      <h3 className="settings-theme-toggle__title">テーマ設定</h3>
      
      <div className="settings-theme-toggle__options">
        <button
          className={`theme-option ${theme === 'light' ? 'theme-option--active' : ''}`}
          onClick={setLightTheme}
        >
          <div className="theme-option__preview theme-option__preview--light">
            <div className="preview-header"></div>
            <div className="preview-content">
              <div className="preview-text"></div>
              <div className="preview-text preview-text--short"></div>
            </div>
          </div>
          <div className="theme-option__info">
            <span className="theme-option__icon">☀️</span>
            <span className="theme-option__name">ライトモード</span>
            <span className="theme-option__description">明るいテーマ</span>
          </div>
        </button>

        <button
          className={`theme-option ${theme === 'dark' ? 'theme-option--active' : ''}`}
          onClick={setDarkTheme}
        >
          <div className="theme-option__preview theme-option__preview--dark">
            <div className="preview-header"></div>
            <div className="preview-content">
              <div className="preview-text"></div>
              <div className="preview-text preview-text--short"></div>
            </div>
          </div>
          <div className="theme-option__info">
            <span className="theme-option__icon">🌙</span>
            <span className="theme-option__name">ダークモード</span>
            <span className="theme-option__description">暗いテーマ・目に優しい</span>
          </div>
        </button>
      </div>

      <div className="settings-theme-toggle__info">
        <p>💡 <strong>Tip:</strong> <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>T</kbd> でクイック切り替え</p>
        <p>🔄 設定は自動的に保存されます</p>
      </div>
    </div>
  );
};

export default ThemeToggle;
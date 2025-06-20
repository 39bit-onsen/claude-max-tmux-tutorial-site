import { useState, useEffect, useContext, createContext } from 'react';

// テーマコンテキスト作成
const ThemeContext = createContext();

// テーマプロバイダー
export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    // ローカルストレージから設定を読み込み
    const savedTheme = localStorage.getItem('tutorial-site-theme');
    
    if (savedTheme) {
      setTheme(savedTheme);
    } else {
      // システム設定を確認
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setTheme(prefersDark ? 'dark' : 'light');
    }
  }, []);

  useEffect(() => {
    // テーマ変更時にローカルストレージに保存
    localStorage.setItem('tutorial-site-theme', theme);
    
    // HTMLルート要素にクラス追加
    document.documentElement.className = theme;
    
    // メタテーマカラー更新
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', theme === 'dark' ? '#0d1117' : '#ffffff');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  const setLightTheme = () => setTheme('light');
  const setDarkTheme = () => setTheme('dark');

  const value = {
    theme,
    toggleTheme,
    setLightTheme,
    setDarkTheme,
    isLight: theme === 'light',
    isDark: theme === 'dark'
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

// テーマフック
export const useTheme = () => {
  const context = useContext(ThemeContext);
  
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  
  return context;
};

// テーマ設定取得関数
export const getThemeConfig = (theme) => {
  const themes = {
    light: {
      name: 'Light',
      icon: '☀️',
      colors: {
        primary: '#2563eb',
        secondary: '#64748b',
        background: '#ffffff',
        surface: '#f8fafc',
        text: '#1e293b',
        textSecondary: '#64748b',
        border: '#e2e8f0',
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
        info: '#3b82f6'
      },
      shadows: {
        sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
        lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
        xl: '0 20px 25px -5px rgb(0 0 0 / 0.1)'
      }
    },
    dark: {
      name: 'Dark',
      icon: '🌙',
      colors: {
        primary: '#3b82f6',
        secondary: '#94a3b8',
        background: '#0d1117',
        surface: '#161b22',
        text: '#f0f6fc',
        textSecondary: '#94a3b8',
        border: '#30363d',
        success: '#238636',
        warning: '#d29922',
        error: '#da3633',
        info: '#2f81f7'
      },
      shadows: {
        sm: '0 1px 2px 0 rgb(0 0 0 / 0.3)',
        md: '0 4px 6px -1px rgb(0 0 0 / 0.4)',
        lg: '0 10px 15px -3px rgb(0 0 0 / 0.4)',
        xl: '0 20px 25px -5px rgb(0 0 0 / 0.4)'
      }
    }
  };

  return themes[theme] || themes.light;
};

export default useTheme;
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useTheme } from '../hooks/useTheme';
import './SearchSystem.css';

const SearchSystem = ({ 
  documents = [], 
  onResultSelect,
  placeholder = "教材を検索...",
  enableAutoComplete = true,
  maxResults = 10 
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [showResults, setShowResults] = useState(false);
  const [searchHistory, setSearchHistory] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const { theme } = useTheme();
  
  const searchInputRef = useRef(null);
  const resultsRef = useRef(null);

  // 検索インデックス構築
  const searchIndex = useMemo(() => {
    const index = new Map();
    const termFrequency = new Map();
    
    documents.forEach((doc, docIndex) => {
      const content = [
        doc.title || '',
        doc.content || '',
        doc.chapter || '',
        doc.tags?.join(' ') || '',
        doc.type || ''
      ].join(' ').toLowerCase();
      
      // 単語に分割（日本語・英語対応）
      const words = content.match(/[\w\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]+/g) || [];
      
      words.forEach(word => {
        if (word.length > 1) { // 1文字の単語は除外
          if (!index.has(word)) {
            index.set(word, new Set());
          }
          index.get(word).add(docIndex);
          
          // 語彙頻度計算
          const key = `${word}-${docIndex}`;
          termFrequency.set(key, (termFrequency.get(key) || 0) + 1);
        }
      });
    });
    
    return { index, termFrequency };
  }, [documents]);

  // 検索実行
  const performSearch = (searchQuery) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setIsSearching(true);
    
    // 検索語を分割
    const searchTerms = searchQuery.toLowerCase()
      .match(/[\w\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]+/g) || [];
    
    if (searchTerms.length === 0) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    // 文書スコア計算
    const docScores = new Map();
    
    searchTerms.forEach(term => {
      if (searchIndex.index.has(term)) {
        const matchingDocs = searchIndex.index.get(term);
        matchingDocs.forEach(docIndex => {
          const tfKey = `${term}-${docIndex}`;
          const tf = searchIndex.termFrequency.get(tfKey) || 1;
          const idf = Math.log(documents.length / matchingDocs.size);
          const score = tf * idf;
          
          docScores.set(docIndex, (docScores.get(docIndex) || 0) + score);
        });
      }
    });

    // 結果をスコア順にソート
    const sortedResults = Array.from(docScores.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, maxResults)
      .map(([docIndex, score]) => {
        const doc = documents[docIndex];
        return {
          ...doc,
          score,
          highlights: generateHighlights(doc, searchTerms)
        };
      });

    setResults(sortedResults);
    setIsSearching(false);
  };

  // ハイライト生成
  const generateHighlights = (doc, searchTerms) => {
    const content = doc.content || '';
    const highlights = [];
    
    searchTerms.forEach(term => {
      const regex = new RegExp(`(${term})`, 'gi');
      const matches = content.match(regex);
      if (matches) {
        // コンテキスト付きでハイライト部分を抽出
        const contextLength = 50;
        const termIndex = content.toLowerCase().indexOf(term.toLowerCase());
        if (termIndex !== -1) {
          const start = Math.max(0, termIndex - contextLength);
          const end = Math.min(content.length, termIndex + term.length + contextLength);
          const context = content.substring(start, end);
          
          highlights.push({
            text: context,
            highlightTerm: term,
            position: termIndex
          });
        }
      }
    });
    
    return highlights;
  };

  // オートコンプリート提案生成
  const generateSuggestions = (input) => {
    if (!input.trim() || input.length < 2) {
      setSuggestions([]);
      return;
    }

    const inputLower = input.toLowerCase();
    const suggestionSet = new Set();
    
    // インデックスから候補を検索
    for (const [word] of searchIndex.index) {
      if (word.includes(inputLower) && word !== inputLower) {
        suggestionSet.add(word);
        if (suggestionSet.size >= 5) break;
      }
    }

    // 文書タイトルからも候補を検索
    documents.forEach(doc => {
      const title = doc.title?.toLowerCase() || '';
      if (title.includes(inputLower) && !suggestionSet.has(title)) {
        suggestionSet.add(doc.title);
        if (suggestionSet.size >= 8) return;
      }
    });

    setSuggestions(Array.from(suggestionSet).slice(0, 5));
  };

  // 検索実行時の処理
  const handleSearch = (searchQuery = query) => {
    if (!searchQuery.trim()) return;
    
    performSearch(searchQuery);
    setShowResults(true);
    
    // 検索履歴に追加
    const newHistory = [searchQuery, ...searchHistory.filter(h => h !== searchQuery)].slice(0, 10);
    setSearchHistory(newHistory);
    localStorage.setItem('tutorial-search-history', JSON.stringify(newHistory));
  };

  // 入力処理
  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    setSelectedIndex(-1);
    
    if (enableAutoComplete) {
      generateSuggestions(value);
    }
    
    // リアルタイム検索（debounce）
    if (value.trim()) {
      const timeoutId = setTimeout(() => {
        performSearch(value);
        setShowResults(true);
      }, 300);
      
      return () => clearTimeout(timeoutId);
    } else {
      setResults([]);
      setShowResults(false);
    }
  };

  // キーボード操作
  const handleKeyDown = (e) => {
    if (!showResults) return;
    
    const totalItems = results.length + (suggestions.length > 0 ? suggestions.length + 1 : 0);
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % totalItems);
        break;
        
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev <= 0 ? totalItems - 1 : prev - 1);
        break;
        
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          if (selectedIndex < suggestions.length) {
            // 提案選択
            const suggestion = suggestions[selectedIndex];
            setQuery(suggestion);
            handleSearch(suggestion);
          } else {
            // 結果選択
            const resultIndex = selectedIndex - (suggestions.length > 0 ? suggestions.length + 1 : 0);
            const result = results[resultIndex];
            if (result && onResultSelect) {
              onResultSelect(result);
            }
          }
        } else {
          handleSearch();
        }
        setShowResults(false);
        break;
        
      case 'Escape':
        setShowResults(false);
        setSelectedIndex(-1);
        break;
    }
  };

  // 検索履歴読み込み
  useEffect(() => {
    const savedHistory = localStorage.getItem('tutorial-search-history');
    if (savedHistory) {
      setSearchHistory(JSON.parse(savedHistory));
    }
  }, []);

  // 外部クリック検知
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (resultsRef.current && !resultsRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="search-system">
      <div className="search-container" ref={resultsRef}>
        {/* 検索入力 */}
        <div className="search-input-container">
          <input
            ref={searchInputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => setShowResults(true)}
            placeholder={placeholder}
            className="search-input"
            aria-label="検索"
            aria-expanded={showResults}
            aria-haspopup="listbox"
          />
          
          <div className="search-actions">
            {query && (
              <button
                onClick={() => {
                  setQuery('');
                  setResults([]);
                  setShowResults(false);
                  searchInputRef.current?.focus();
                }}
                className="clear-button"
                aria-label="検索をクリア"
              >
                ✕
              </button>
            )}
            
            <button
              onClick={() => handleSearch()}
              className="search-button"
              aria-label="検索実行"
            >
              🔍
            </button>
          </div>
          
          {isSearching && (
            <div className="search-loading">
              <span className="loading-spinner">⏳</span>
            </div>
          )}
        </div>

        {/* 検索結果・提案 */}
        {showResults && (suggestions.length > 0 || results.length > 0 || searchHistory.length > 0) && (
          <div className="search-results" role="listbox">
            {/* オートコンプリート提案 */}
            {suggestions.length > 0 && (
              <div className="suggestions-section">
                <div className="section-header">💡 提案</div>
                {suggestions.map((suggestion, index) => (
                  <div
                    key={`suggestion-${index}`}
                    className={`suggestion-item ${selectedIndex === index ? 'selected' : ''}`}
                    onClick={() => {
                      setQuery(suggestion);
                      handleSearch(suggestion);
                      setShowResults(false);
                    }}
                    role="option"
                    aria-selected={selectedIndex === index}
                  >
                    <span className="suggestion-icon">🔍</span>
                    <span className="suggestion-text">{suggestion}</span>
                  </div>
                ))}
              </div>
            )}

            {/* 検索結果 */}
            {results.length > 0 && (
              <div className="results-section">
                {suggestions.length > 0 && <div className="section-divider" />}
                <div className="section-header">
                  📚 検索結果 ({results.length}件)
                </div>
                {results.map((result, index) => {
                  const itemIndex = suggestions.length > 0 ? suggestions.length + 1 + index : index;
                  return (
                    <div
                      key={`result-${index}`}
                      className={`result-item ${selectedIndex === itemIndex ? 'selected' : ''}`}
                      onClick={() => {
                        if (onResultSelect) {
                          onResultSelect(result);
                        }
                        setShowResults(false);
                      }}
                      role="option"
                      aria-selected={selectedIndex === itemIndex}
                    >
                      <div className="result-header">
                        <span className="result-type">{result.type || 'ドキュメント'}</span>
                        <span className="result-chapter">
                          {result.chapter && `第${result.chapter}章`}
                        </span>
                        <span className="result-score">
                          {Math.round(result.score * 100) / 100}
                        </span>
                      </div>
                      
                      <h4 className="result-title">{result.title}</h4>
                      
                      {result.highlights && result.highlights.length > 0 && (
                        <div className="result-highlight">
                          {result.highlights[0].text.split(new RegExp(`(${result.highlights[0].highlightTerm})`, 'gi'))
                            .map((part, i) => 
                              part.toLowerCase() === result.highlights[0].highlightTerm.toLowerCase() ? 
                                <mark key={i}>{part}</mark> : part
                            )}
                        </div>
                      )}
                      
                      {result.tags && (
                        <div className="result-tags">
                          {result.tags.slice(0, 3).map((tag, i) => (
                            <span key={i} className="result-tag">{tag}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* 検索履歴 */}
            {query === '' && searchHistory.length > 0 && (
              <div className="history-section">
                <div className="section-header">📅 最近の検索</div>
                {searchHistory.slice(0, 5).map((historyItem, index) => (
                  <div
                    key={`history-${index}`}
                    className="history-item"
                    onClick={() => {
                      setQuery(historyItem);
                      handleSearch(historyItem);
                    }}
                  >
                    <span className="history-icon">🕒</span>
                    <span className="history-text">{historyItem}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const newHistory = searchHistory.filter(h => h !== historyItem);
                        setSearchHistory(newHistory);
                        localStorage.setItem('tutorial-search-history', JSON.stringify(newHistory));
                      }}
                      className="history-remove"
                      aria-label="履歴から削除"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                
                {searchHistory.length > 0 && (
                  <button
                    onClick={() => {
                      setSearchHistory([]);
                      localStorage.removeItem('tutorial-search-history');
                    }}
                    className="clear-history-button"
                  >
                    履歴をクリア
                  </button>
                )}
              </div>
            )}

            {/* 結果なし */}
            {query && results.length === 0 && !isSearching && (
              <div className="no-results">
                <div className="no-results-icon">🔍</div>
                <div className="no-results-title">検索結果が見つかりません</div>
                <div className="no-results-suggestions">
                  <p>以下をお試しください:</p>
                  <ul>
                    <li>キーワードを変更する</li>
                    <li>より一般的な用語を使用する</li>
                    <li>スペルを確認する</li>
                    <li>別の表現で検索する</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 検索統計 */}
      {results.length > 0 && (
        <div className="search-stats">
          <span>
            約 {results.length} 件の結果 
            (検索時間: {isSearching ? '検索中...' : '0.1秒'})
          </span>
        </div>
      )}
    </div>
  );
};

export default SearchSystem;
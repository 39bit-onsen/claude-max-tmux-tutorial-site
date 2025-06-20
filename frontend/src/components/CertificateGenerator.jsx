import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../hooks/useTheme';
import './CertificateGenerator.css';

const CertificateGenerator = ({ 
  userName, 
  completedChapters = [], 
  completionDate, 
  skills = [],
  certificateType = 'completion'
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedUrls, setGeneratedUrls] = useState({ png: null, pdf: null });
  const canvasRef = useRef(null);
  const { theme } = useTheme();

  // 修了証テンプレート
  const certificateTemplates = {
    completion: {
      title: 'Course Completion Certificate',
      subtitle: 'tmux + Claude Multi-Agent Mastery',
      description: 'has successfully completed the comprehensive tutorial',
      badgeColor: '#10b981',
      borderColor: '#059669'
    },
    expert: {
      title: 'Expert Certification',
      subtitle: 'tmux + Claude Multi-Agent Expert',
      description: 'has demonstrated expert-level proficiency in',
      badgeColor: '#3b82f6',
      borderColor: '#2563eb'
    },
    practitioner: {
      title: 'Practitioner Certificate',
      subtitle: 'tmux + Claude Multi-Agent Practitioner',
      description: 'has achieved practitioner status in',
      badgeColor: '#f59e0b',
      borderColor: '#d97706'
    }
  };

  const template = certificateTemplates[certificateType] || certificateTemplates.completion;

  // バッジ生成
  const generateBadge = (skill, level) => {
    const badgeTypes = {
      'tmux-basics': { icon: '🖥️', name: 'tmux Basics', color: '#10b981' },
      'claude-integration': { icon: '🤖', name: 'Claude Integration', color: '#3b82f6' },
      'multi-agent': { icon: '👥', name: 'Multi-Agent Systems', color: '#8b5cf6' },
      'automation': { icon: '⚡', name: 'Automation', color: '#f59e0b' },
      'project-management': { icon: '📋', name: 'Project Management', color: '#ef4444' }
    };

    const badge = badgeTypes[skill] || { icon: '🏆', name: skill, color: '#6b7280' };
    
    return {
      ...badge,
      level: level || 'Completed',
      earnedDate: completionDate
    };
  };

  // Canvas描画関数
  const drawCertificate = (canvas, format = 'png') => {
    const ctx = canvas.getContext('2d');
    const width = format === 'png' ? 1200 : 2480; // A4サイズの場合
    const height = format === 'png' ? 800 : 3508;
    
    canvas.width = width;
    canvas.height = height;

    // 背景
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    if (theme === 'dark') {
      gradient.addColorStop(0, '#0d1117');
      gradient.addColorStop(1, '#161b22');
    } else {
      gradient.addColorStop(0, '#ffffff');
      gradient.addColorStop(1, '#f8fafc');
    }
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // 装飾的な境界線
    ctx.strokeStyle = template.borderColor;
    ctx.lineWidth = 8;
    ctx.strokeRect(40, 40, width - 80, height - 80);

    // 内側の境界線
    ctx.strokeStyle = theme === 'dark' ? '#30363d' : '#e2e8f0';
    ctx.lineWidth = 2;
    ctx.strokeRect(60, 60, width - 120, height - 120);

    // タイトル
    ctx.fillStyle = theme === 'dark' ? '#f0f6fc' : '#1e293b';
    ctx.font = 'bold 64px serif';
    ctx.textAlign = 'center';
    ctx.fillText(template.title, width / 2, 180);

    // サブタイトル
    ctx.fillStyle = template.badgeColor;
    ctx.font = '32px sans-serif';
    ctx.fillText(template.subtitle, width / 2, 240);

    // メイン文章
    ctx.fillStyle = theme === 'dark' ? '#94a3b8' : '#64748b';
    ctx.font = '24px serif';
    ctx.fillText('This certifies that', width / 2, 320);

    // ユーザー名
    ctx.fillStyle = theme === 'dark' ? '#f0f6fc' : '#1e293b';
    ctx.font = 'bold 48px serif';
    ctx.fillText(userName || 'Student Name', width / 2, 400);

    // 説明文
    ctx.fillStyle = theme === 'dark' ? '#94a3b8' : '#64748b';
    ctx.font = '24px serif';
    ctx.fillText(template.description, width / 2, 460);
    ctx.fillText('tmux + Claude Multi-Agent Development System', width / 2, 500);

    // 完了章情報
    if (completedChapters.length > 0) {
      ctx.font = '20px sans-serif';
      ctx.fillText(`Completed ${completedChapters.length}/5 chapters`, width / 2, 560);
    }

    // 日付
    ctx.fillStyle = theme === 'dark' ? '#94a3b8' : '#64748b';
    ctx.font = '18px sans-serif';
    const date = completionDate ? new Date(completionDate).toLocaleDateString() : new Date().toLocaleDateString();
    ctx.fillText(`Completed on ${date}`, width / 2, 620);

    // 署名エリア
    ctx.fillStyle = theme === 'dark' ? '#30363d' : '#e2e8f0';
    ctx.fillRect(width / 2 - 200, 680, 400, 2);
    ctx.fillStyle = theme === 'dark' ? '#94a3b8' : '#64748b';
    ctx.font = '16px sans-serif';
    ctx.fillText('Course Instructor', width / 2, 710);

    // ロゴ・印章エリア
    ctx.beginPath();
    ctx.arc(width - 150, height - 150, 60, 0, 2 * Math.PI);
    ctx.strokeStyle = template.badgeColor;
    ctx.lineWidth = 3;
    ctx.stroke();
    
    ctx.fillStyle = template.badgeColor;
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText('CERTIFIED', width - 150, height - 145);
    ctx.font = '14px sans-serif';
    ctx.fillText('2025', width - 150, height - 125);

    return canvas;
  };

  // PNG生成
  const generatePNG = async () => {
    const canvas = canvasRef.current;
    const drawnCanvas = drawCertificate(canvas, 'png');
    
    return new Promise((resolve) => {
      drawnCanvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        resolve(url);
      }, 'image/png', 1.0);
    });
  };

  // PDF生成（簡易版 - 実際にはjsPDFを使用）
  const generatePDF = async () => {
    // jsPDF実装ここに追加
    // 今回は簡易版としてcanvasベースで実装
    const canvas = canvasRef.current;
    const drawnCanvas = drawCertificate(canvas, 'pdf');
    
    return new Promise((resolve) => {
      drawnCanvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        resolve(url);
      }, 'image/png', 1.0);
    });
  };

  // 修了証生成処理
  const handleGenerate = async () => {
    if (!userName) return;
    
    setIsGenerating(true);
    
    try {
      const [pngUrl, pdfUrl] = await Promise.all([
        generatePNG(),
        generatePDF()
      ]);
      
      setGeneratedUrls({ png: pngUrl, pdf: pdfUrl });
    } catch (error) {
      console.error('Certificate generation failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  // ダウンロード機能
  const downloadCertificate = (format) => {
    const url = generatedUrls[format];
    if (!url) return;

    const link = document.createElement('a');
    link.href = url;
    link.download = `tmux-claude-certificate-${userName}-${Date.now()}.${format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // SNS共有機能
  const shareCertificate = (platform) => {
    const text = `I just completed the tmux + Claude Multi-Agent tutorial! 🎉 #tmux #claude #coding`;
    const url = window.location.href;
    
    const shareUrls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
    };

    if (shareUrls[platform]) {
      window.open(shareUrls[platform], '_blank', 'width=600,height=400');
    }
  };

  // 初期化時にプレビュー生成
  useEffect(() => {
    if (userName && canvasRef.current) {
      drawCertificate(canvasRef.current, 'png');
    }
  }, [userName, theme, completedChapters]);

  return (
    <div className="certificate-generator">
      <div className="certificate-header">
        <h2>🏆 修了証・バッジ発行</h2>
        <p>学習の成果を形に残しましょう</p>
      </div>

      {/* バッジ表示エリア */}
      <div className="badges-section">
        <h3>📋 獲得バッジ</h3>
        <div className="badges-grid">
          {skills.map((skill, index) => {
            const badge = generateBadge(skill, 'Completed');
            return (
              <div key={index} className="badge-card">
                <div className="badge-icon" style={{ backgroundColor: badge.color }}>
                  {badge.icon}
                </div>
                <div className="badge-info">
                  <h4>{badge.name}</h4>
                  <p>{badge.level}</p>
                  <span className="badge-date">{badge.earnedDate}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 修了証プレビュー */}
      <div className="certificate-preview">
        <h3>📜 修了証プレビュー</h3>
        <div className="canvas-container">
          <canvas 
            ref={canvasRef}
            className="certificate-canvas"
            style={{ 
              maxWidth: '100%', 
              height: 'auto',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-lg)'
            }}
          />
        </div>
      </div>

      {/* 生成・ダウンロードコントロール */}
      <div className="certificate-controls">
        <div className="input-section">
          <label htmlFor="userName">👤 受講者名</label>
          <input
            id="userName"
            type="text"
            value={userName || ''}
            onChange={(e) => setUserName && setUserName(e.target.value)}
            placeholder="あなたの名前を入力してください"
            className="name-input"
          />
        </div>

        <div className="action-buttons">
          <button
            onClick={handleGenerate}
            disabled={!userName || isGenerating}
            className="generate-button"
          >
            {isGenerating ? '🔄 生成中...' : '🎨 修了証を生成'}
          </button>

          {generatedUrls.png && (
            <div className="download-buttons">
              <button
                onClick={() => downloadCertificate('png')}
                className="download-button download-png"
              >
                📷 PNG ダウンロード
              </button>
              
              <button
                onClick={() => downloadCertificate('pdf')}
                className="download-button download-pdf"
              >
                📄 PDF ダウンロード
              </button>
            </div>
          )}
        </div>
      </div>

      {/* SNS共有セクション */}
      {generatedUrls.png && (
        <div className="social-share">
          <h3>🌟 成果をシェア</h3>
          <div className="share-buttons">
            <button
              onClick={() => shareCertificate('twitter')}
              className="share-button share-twitter"
            >
              🐦 Twitter
            </button>
            
            <button
              onClick={() => shareCertificate('linkedin')}
              className="share-button share-linkedin"
            >
              💼 LinkedIn
            </button>
            
            <button
              onClick={() => shareCertificate('facebook')}
              className="share-button share-facebook"
            >
              📘 Facebook
            </button>
          </div>
          
          <div className="share-tips">
            <p>💡 <strong>Tips:</strong></p>
            <ul>
              <li>LinkedInプロフィールに追加して専門スキルをアピール</li>
              <li>ポートフォリオサイトに掲載</li>
              <li>GitHubのREADMEに修了証を表示</li>
            </ul>
          </div>
        </div>
      )}

      {/* 統計情報 */}
      <div className="completion-stats">
        <h3>📊 学習統計</h3>
        <div className="stats-grid">
          <div className="stat-item">
            <span className="stat-value">{completedChapters.length}</span>
            <span className="stat-label">完了章数</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{skills.length}</span>
            <span className="stat-label">獲得スキル</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">
              {Math.round((completedChapters.length / 5) * 100)}%
            </span>
            <span className="stat-label">進捗率</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CertificateGenerator;
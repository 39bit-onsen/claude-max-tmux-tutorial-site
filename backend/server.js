const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const progressRoutes = require('./routes/progress');
const { initDatabase } = require('./database/db');

const app = express();
const PORT = process.env.PORT || 3001;

// セキュリティミドルウェア
app.use(helmet());

// CORS設定
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));

// レート制限
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分
  max: 100, // リクエスト数制限
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// JSONパース
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// データベース初期化
initDatabase();

// ルート設定
app.use('/api/auth', authRoutes);
app.use('/api/progress', progressRoutes);

// ヘルスチェック
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'tmux-claudemax-tutorial-backend'
  });
});

// 404ハンドラー
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// エラーハンドラー
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📚 tmux+claudeMAX Tutorial Backend`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
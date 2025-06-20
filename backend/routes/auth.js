const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { runQuery, getQuery } = require('../database/db');

const router = express.Router();

// ユーザー登録
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // 入力検証
    if (!username || !password) {
      return res.status(400).json({ error: 'ユーザー名とパスワードは必須です' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'パスワードは6文字以上である必要があります' });
    }

    // 既存ユーザーチェック
    const existingUser = await getQuery(
      'SELECT id FROM users WHERE username = ? OR email = ?',
      [username, email || '']
    );

    if (existingUser) {
      return res.status(409).json({ error: 'ユーザー名またはメールアドレスが既に使用されています' });
    }

    // パスワードハッシュ化
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // ユーザー作成
    const result = await runQuery(
      'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
      [username, email || null, passwordHash]
    );

    // JWTトークン生成
    const token = jwt.sign(
      { userId: result.id, username },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'ユーザー登録が完了しました',
      token,
      user: {
        id: result.id,
        username,
        email: email || null
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'ユーザー登録に失敗しました' });
  }
});

// ユーザーログイン
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // 入力検証
    if (!username || !password) {
      return res.status(400).json({ error: 'ユーザー名とパスワードは必須です' });
    }

    // ユーザー検索
    const user = await getQuery(
      'SELECT id, username, email, password_hash FROM users WHERE username = ?',
      [username]
    );

    if (!user) {
      return res.status(401).json({ error: 'ユーザー名またはパスワードが間違っています' });
    }

    // パスワード検証
    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'ユーザー名またはパスワードが間違っています' });
    }

    // JWTトークン生成
    const token = jwt.sign(
      { userId: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'ログインしました',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'ログインに失敗しました' });
  }
});

// トークン検証ミドルウェア
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'アクセストークンが必要です' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'トークンが無効です' });
    }
    req.user = user;
    next();
  });
}

// プロフィール取得
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await getQuery(
      'SELECT id, username, email, created_at FROM users WHERE id = ?',
      [req.user.userId]
    );

    if (!user) {
      return res.status(404).json({ error: 'ユーザーが見つかりません' });
    }

    res.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        createdAt: user.created_at
      }
    });

  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ error: 'プロフィールの取得に失敗しました' });
  }
});

module.exports = { router, authenticateToken };
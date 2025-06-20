const express = require('express');
const { runQuery, getQuery, allQuery } = require('../database/db');
const { authenticateToken } = require('./auth');

const router = express.Router();

// 全ての章情報を取得
router.get('/chapters', async (req, res) => {
  try {
    const chapters = await allQuery(
      'SELECT id, title, description, order_index FROM chapters ORDER BY order_index'
    );

    res.json({
      chapters: chapters || []
    });

  } catch (error) {
    console.error('Chapters fetch error:', error);
    res.status(500).json({ error: '章情報の取得に失敗しました' });
  }
});

// ユーザーの進捗状況を取得
router.get('/user', authenticateToken, async (req, res) => {
  try {
    const progress = await allQuery(`
      SELECT 
        c.id as chapter_id,
        c.title,
        c.description,
        c.order_index,
        COALESCE(up.completed, 0) as completed,
        COALESCE(up.progress_percentage, 0) as progress_percentage,
        up.completed_at
      FROM chapters c
      LEFT JOIN user_progress up ON c.id = up.chapter_id AND up.user_id = ?
      ORDER BY c.order_index
    `, [req.user.userId]);

    // 全体の進捗率を計算
    const totalChapters = progress.length;
    const completedChapters = progress.filter(p => p.completed).length;
    const overallProgress = totalChapters > 0 ? Math.round((completedChapters / totalChapters) * 100) : 0;

    res.json({
      overallProgress,
      completedChapters,
      totalChapters,
      chapters: progress
    });

  } catch (error) {
    console.error('User progress fetch error:', error);
    res.status(500).json({ error: '進捗情報の取得に失敗しました' });
  }
});

// 特定の章の進捗を更新
router.put('/chapter/:chapterId', authenticateToken, async (req, res) => {
  try {
    const { chapterId } = req.params;
    const { completed, progressPercentage } = req.body;

    // 入力検証
    if (typeof completed !== 'boolean' && typeof progressPercentage !== 'number') {
      return res.status(400).json({ error: '無効な進捗データです' });
    }

    if (progressPercentage !== undefined && (progressPercentage < 0 || progressPercentage > 100)) {
      return res.status(400).json({ error: '進捗率は0-100の範囲で指定してください' });
    }

    // 章の存在確認
    const chapter = await getQuery('SELECT id FROM chapters WHERE id = ?', [chapterId]);
    if (!chapter) {
      return res.status(404).json({ error: '指定された章が見つかりません' });
    }

    // 既存の進捗レコード確認
    const existingProgress = await getQuery(
      'SELECT id FROM user_progress WHERE user_id = ? AND chapter_id = ?',
      [req.user.userId, chapterId]
    );

    const completedAt = completed ? new Date().toISOString() : null;

    if (existingProgress) {
      // 更新
      await runQuery(`
        UPDATE user_progress 
        SET 
          completed = COALESCE(?, completed),
          progress_percentage = COALESCE(?, progress_percentage),
          completed_at = CASE WHEN ? = 1 THEN ? ELSE completed_at END,
          updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ? AND chapter_id = ?
      `, [
        completed,
        progressPercentage,
        completed ? 1 : 0,
        completedAt,
        req.user.userId,
        chapterId
      ]);
    } else {
      // 新規作成
      await runQuery(`
        INSERT INTO user_progress (user_id, chapter_id, completed, progress_percentage, completed_at)
        VALUES (?, ?, ?, ?, ?)
      `, [
        req.user.userId,
        chapterId,
        completed || false,
        progressPercentage || 0,
        completedAt
      ]);
    }

    // 更新後の進捗を取得
    const updatedProgress = await getQuery(`
      SELECT 
        c.id as chapter_id,
        c.title,
        up.completed,
        up.progress_percentage,
        up.completed_at,
        up.updated_at
      FROM chapters c
      LEFT JOIN user_progress up ON c.id = up.chapter_id AND up.user_id = ?
      WHERE c.id = ?
    `, [req.user.userId, chapterId]);

    res.json({
      message: '進捗を更新しました',
      progress: updatedProgress
    });

  } catch (error) {
    console.error('Progress update error:', error);
    res.status(500).json({ error: '進捗の更新に失敗しました' });
  }
});

// 進捗をリセット
router.delete('/reset', authenticateToken, async (req, res) => {
  try {
    await runQuery('DELETE FROM user_progress WHERE user_id = ?', [req.user.userId]);

    res.json({
      message: '全ての進捗をリセットしました'
    });

  } catch (error) {
    console.error('Progress reset error:', error);
    res.status(500).json({ error: '進捗リセットに失敗しました' });
  }
});

// 特定章の進捗リセット
router.delete('/chapter/:chapterId', authenticateToken, async (req, res) => {
  try {
    const { chapterId } = req.params;

    // 章の存在確認
    const chapter = await getQuery('SELECT id FROM chapters WHERE id = ?', [chapterId]);
    if (!chapter) {
      return res.status(404).json({ error: '指定された章が見つかりません' });
    }

    await runQuery(
      'DELETE FROM user_progress WHERE user_id = ? AND chapter_id = ?',
      [req.user.userId, chapterId]
    );

    res.json({
      message: '章の進捗をリセットしました'
    });

  } catch (error) {
    console.error('Chapter progress reset error:', error);
    res.status(500).json({ error: '章の進捗リセットに失敗しました' });
  }
});

module.exports = router;
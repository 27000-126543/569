import { Router, type Request, type Response } from 'express';
import { db } from '../data/db.js';

const router = Router();

router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, type } = req.query;

    if (!userId) {
      res.status(400).json({
        success: false,
        message: '缺少用户ID',
      });
      return;
    }

    let messages = db.getMessagesByUser(userId as string);

    if (type && type !== 'all') {
      messages = messages.filter(m => m.type === type);
    }

    res.json({
      success: true,
      messages,
      unreadCount: db.getUnreadMessageCount(userId as string),
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({
      success: false,
      message: '获取消息失败',
    });
  }
});

router.get('/unread-count', async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.query;

    if (!userId) {
      res.status(400).json({
        success: false,
        message: '缺少用户ID',
      });
      return;
    }

    const count = db.getUnreadMessageCount(userId as string);

    res.json({
      success: true,
      count,
    });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({
      success: false,
      message: '获取未读消息数失败',
    });
  }
});

router.put('/:id/read', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const success = db.markMessageRead(id);

    if (!success) {
      res.status(404).json({
        success: false,
        message: '消息不存在',
      });
      return;
    }

    res.json({
      success: true,
      message: '已标记为已读',
    });
  } catch (error) {
    console.error('Mark message read error:', error);
    res.status(500).json({
      success: false,
      message: '操作失败',
    });
  }
});

router.put('/read-all', async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.body;

    if (!userId) {
      res.status(400).json({
        success: false,
        message: '缺少用户ID',
      });
      return;
    }

    db.messages.forEach(m => {
      if (m.userId === userId) {
        m.isRead = true;
      }
    });

    res.json({
      success: true,
      message: '已全部标记为已读',
    });
  } catch (error) {
    console.error('Mark all read error:', error);
    res.status(500).json({
      success: false,
      message: '操作失败',
    });
  }
});

export default router;

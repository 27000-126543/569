import { Router, type Request, type Response } from 'express';
import { db } from '../data/db.js';
import type { LoginRequest, User, Student, Coach } from '../../shared/types';

const router = Router();

router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password, role }: LoginRequest = req.body;

    const user = db.findUserByUsername(username);

    if (!user || user.role !== role) {
      res.status(401).json({
        success: false,
        message: '用户名或密码错误',
      });
      return;
    }

    const correctPassword = db.passwords[user.id];
    if (password !== correctPassword) {
      res.status(401).json({
        success: false,
        message: '用户名或密码错误',
      });
      return;
    }

    const token = Buffer.from(`${user.id}:${Date.now()}`).toString('base64');

    let profile: Record<string, unknown> = { user };

    if (role === 'student') {
      const student = db.findStudentByUserId(user.id);
      if (student) {
        profile.student = student;
      }
    } else if (role === 'coach') {
      const coach = db.findCoachByUserId(user.id);
      if (coach) {
        profile.coach = coach;
      }
    }

    res.json({
      success: true,
      ...profile,
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: '登录失败，请稍后重试',
    });
  }
});

router.get('/profile', async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.headers['x-user-id'] as string;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: '未登录',
      });
      return;
    }

    const user = db.users.find(u => u.id === userId);

    if (!user) {
      res.status(404).json({
        success: false,
        message: '用户不存在',
      });
      return;
    }

    let profile: Record<string, unknown> = { user };

    if (user.role === 'student') {
      const student = db.findStudentByUserId(user.id);
      if (student) {
        profile.student = student;
      }
    } else if (user.role === 'coach') {
      const coach = db.findCoachByUserId(user.id);
      if (coach) {
        profile.coach = coach;
      }
    }

    res.json({
      success: true,
      ...profile,
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: '获取用户信息失败',
    });
  }
});

router.post('/logout', async (req: Request, res: Response): Promise<void> => {
  res.json({
    success: true,
    message: '登出成功',
  });
});

export default router;

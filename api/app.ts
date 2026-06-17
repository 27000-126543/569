/**
 * 驾校管理平台 API 服务器
 */

import express, {
  type Request,
  type Response,
  type NextFunction,
} from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import authRoutes from './routes/auth.js';
import studentRoutes from './routes/students.js';
import coachRoutes from './routes/coaches.js';
import trainingRoutes from './routes/training.js';
import examRoutes from './routes/exam.js';
import refundRoutes from './routes/refunds.js';
import messageRoutes from './routes/messages.js';
import reportRoutes from './routes/reports.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app: express.Application = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/coaches', coachRoutes);
app.use('/api/training', trainingRoutes);
app.use('/api/exam', examRoutes);
app.use('/api/refunds', refundRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/reports', reportRoutes);

app.get(
  '/api/health',
  (req: Request, res: Response, next: NextFunction): void => {
    res.status(200).json({
      success: true,
      message: 'ok',
    });
  },
);

app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Server error:', error);
  res.status(500).json({
    success: false,
    error: 'Server internal error',
  });
});

app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'API not found',
  });
});

export default app;

import { Router, type Request, type Response } from 'express';
import { db } from '../data/db.js';

const router = Router();

router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { licenseType } = req.query;

    let coaches = [...db.coaches];

    if (licenseType) {
      coaches = coaches.filter(c => c.licenseType === licenseType);
    }

    const coachesWithNames = coaches.map(coach => {
      const user = db.users.find(u => u.id === coach.userId);
      return {
        ...coach,
        name: user?.name || '',
        avatar: user?.avatar,
      };
    });

    res.json({
      success: true,
      coaches: coachesWithNames,
    });
  } catch (error) {
    console.error('Get coaches error:', error);
    res.status(500).json({
      success: false,
      message: '获取教练列表失败',
    });
  }
});

router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const coach = db.findCoachById(id);

    if (!coach) {
      res.status(404).json({
        success: false,
        message: '教练不存在',
      });
      return;
    }

    const user = db.users.find(u => u.id === coach.userId);

    res.json({
      success: true,
      coach: {
        ...coach,
        name: user?.name || '',
        avatar: user?.avatar,
      },
    });
  } catch (error) {
    console.error('Get coach error:', error);
    res.status(500).json({
      success: false,
      message: '获取教练信息失败',
    });
  }
});

router.get('/:id/students', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const students = db.getCoachStudents(id);

    const studentsWithNames = students.map(student => {
      const user = db.users.find(u => u.id === student.userId);
      return {
        ...student,
        name: user?.name || '',
        phone: user?.phone || '',
      };
    });

    res.json({
      success: true,
      students: studentsWithNames,
    });
  } catch (error) {
    console.error('Get coach students error:', error);
    res.status(500).json({
      success: false,
      message: '获取学员列表失败',
    });
  }
});

router.get('/:id/training-records', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const records = db.getTrainingRecordsByCoach(id);

    const recordsWithNames = records.map(record => {
      const studentUser = db.users.find(u => {
        const student = db.findStudentById(record.studentId);
        return student?.userId === u.id;
      });
      return {
        ...record,
        studentName: studentUser?.name || '',
      };
    });

    res.json({
      success: true,
      records: recordsWithNames,
    });
  } catch (error) {
    console.error('Get coach training records error:', error);
    res.status(500).json({
      success: false,
      message: '获取培训记录失败',
    });
  }
});

router.get('/:id/training-plans', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const plans = db.getTrainingPlansByCoach(id);

    res.json({
      success: true,
      plans,
    });
  } catch (error) {
    console.error('Get coach training plans error:', error);
    res.status(500).json({
      success: false,
      message: '获取培训计划失败',
    });
  }
});

router.get('/:id/stats', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const stats = db.coachStats.find(s => s.coachId === id);

    if (!stats) {
      res.status(404).json({
        success: false,
        message: '统计数据不存在',
      });
      return;
    }

    res.json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error('Get coach stats error:', error);
    res.status(500).json({
      success: false,
      message: '获取统计数据失败',
    });
  }
});

export default router;

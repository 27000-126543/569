import { Router, type Request, type Response } from 'express';
import { db } from '../data/db.js';
import type { RegisterRequest, Student, Coach } from '../../shared/types';

const router = Router();

router.post('/register', async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, phone, idCard, licenseType, availableSlots }: RegisterRequest = req.body;

    const matchedCoach = db.matchCoach(licenseType, availableSlots);

    if (!matchedCoach) {
      res.status(400).json({
        success: false,
        message: '暂无可用教练，请稍后再试或选择其他时段',
      });
      return;
    }

    const userId = db.generateId('student');
    const studentId = userId;

    const newUser = {
      id: userId,
      username: `student_${phone.slice(-4)}`,
      role: 'student' as const,
      name,
      phone,
      createdAt: new Date().toISOString(),
    };

    const totalFee = licenseType === 'C1' ? 5800 : 6200;
    const totalHours = 62;

    const newStudent: Student = {
      id: studentId,
      userId,
      licenseType,
      status: 'studying',
      registerDate: new Date().toISOString().split('T')[0],
      coachId: matchedCoach.id,
      totalFee,
      totalHours,
      completedHours: 0,
      subjects: [
        { subject: 'subject-1', subjectName: '科目一', requiredHours: 12, completedHours: 0, status: 'pending' },
        { subject: 'subject-2', subjectName: '科目二', requiredHours: 16, completedHours: 0, status: 'pending' },
        { subject: 'subject-3', subjectName: '科目三', requiredHours: 24, completedHours: 0, status: 'pending' },
        { subject: 'subject-4', subjectName: '科目四', requiredHours: 10, completedHours: 0, status: 'pending' },
      ],
    };

    db.users.push(newUser);
    db.students.push(newStudent);
    db.passwords[userId] = '123456';

    const coach = db.findCoachById(matchedCoach.id);
    if (coach) {
      coach.currentStudents += 1;
    }

    const trainingPlans = db.generateTrainingPlans(
      studentId,
      name,
      matchedCoach.id,
      availableSlots,
      matchedCoach.availableSlots || []
    );
    db.addTrainingPlans(trainingPlans);

    db.addMessage({
      userId,
      type: 'system',
      title: '报名成功通知',
      content: `恭喜您成功报名${licenseType}驾驶证培训！系统已为您匹配${db.users.find(u => u.id === matchedCoach.id)?.name || '教练'}，并为您安排了${trainingPlans.length}节初始培训课程，请按时参加培训。`,
      relatedId: studentId,
      relatedType: 'registration',
      hasAttachment: true,
    });

    db.addMessage({
      userId: matchedCoach.userId,
      type: 'training',
      title: '新学员分配通知',
      content: `您有新学员${name}分配到您名下，请及时安排培训计划。`,
      relatedId: studentId,
      relatedType: 'student_assignment',
    });

    res.json({
      success: true,
      student: newStudent,
      user: newUser,
      matchedCoach,
      trainingPlans,
      message: '报名成功！',
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: '报名失败，请稍后重试',
    });
  }
});

router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const student = db.findStudentById(id);

    if (!student) {
      res.status(404).json({
        success: false,
        message: '学员不存在',
      });
      return;
    }

    const coach = db.findCoachById(student.coachId);
    const coachUser = coach ? db.users.find(u => u.id === coach.userId) : null;

    res.json({
      success: true,
      student,
      coach: coach ? { ...coach, name: coachUser?.name } : null,
    });
  } catch (error) {
    console.error('Get student error:', error);
    res.status(500).json({
      success: false,
      message: '获取学员信息失败',
    });
  }
});

router.get('/:id/training-records', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const records = db.getTrainingRecordsByStudent(id);

    res.json({
      success: true,
      records,
    });
  } catch (error) {
    console.error('Get training records error:', error);
    res.status(500).json({
      success: false,
      message: '获取培训记录失败',
    });
  }
});

router.get('/:id/training-plans', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const plans = db.getTrainingPlansByStudent(id);

    res.json({
      success: true,
      plans,
    });
  } catch (error) {
    console.error('Get training plans error:', error);
    res.status(500).json({
      success: false,
      message: '获取培训计划失败',
    });
  }
});

router.get('/:id/exam-appointments', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const appointments = db.getExamAppointmentsByStudent(id);

    res.json({
      success: true,
      appointments,
    });
  } catch (error) {
    console.error('Get exam appointments error:', error);
    res.status(500).json({
      success: false,
      message: '获取考试预约失败',
    });
  }
});

router.get('/:id/refund-requests', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const requests = db.getRefundRequestsByStudent(id);

    res.json({
      success: true,
      requests,
    });
  } catch (error) {
    console.error('Get refund requests error:', error);
    res.status(500).json({
      success: false,
      message: '获取退费申请失败',
    });
  }
});

export default router;

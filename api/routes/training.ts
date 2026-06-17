import { Router, type Request, type Response } from 'express';
import { db } from '../data/db.js';
import type { TrainingRecord } from '../../shared/types';

const router = Router();

router.post('/signin', async (req: Request, res: Response): Promise<void> => {
  try {
    const { coachId, studentId, subject, subjectName, hours } = req.body;

    const today = new Date().toISOString().split('T')[0];
    const now = new Date().toTimeString().slice(0, 5);

    const newRecord: TrainingRecord = {
      id: db.generateId('record'),
      studentId,
      coachId,
      subject,
      subjectName,
      hours: hours || 2,
      trainingDate: today,
      signInTime: now,
      status: 'in_progress',
    };

    db.trainingRecords.push(newRecord);

    const student = db.findStudentById(studentId);
    if (student) {
      const subjectIndex = student.subjects.find(s => s.subject === subject);
      if (subjectIndex) {
        subjectIndex.status = 'studying';
      }
    }

    const studentUser = db.users.find(u => {
      const s = db.findStudentById(studentId);
      return s?.userId === u.id;
    });

    if (studentUser) {
      db.addMessage({
        userId: studentUser.id,
        type: 'training',
        title: '培训签到成功',
        content: `您已完成${subjectName}签到，培训开始时间：${now}，请认真学习。`,
        relatedId: newRecord.id,
        relatedType: 'training_record',
      });
    }

    res.json({
      success: true,
      record: newRecord,
      message: '签到成功',
    });
  } catch (error) {
    console.error('Training signin error:', error);
    res.status(500).json({
      success: false,
      message: '签到失败',
    });
  }
});

router.post('/signout', async (req: Request, res: Response): Promise<void> => {
  try {
    const { recordId } = req.body;

    const record = db.trainingRecords.find(r => r.id === recordId);

    if (!record) {
      res.status(404).json({
        success: false,
        message: '培训记录不存在',
      });
      return;
    }

    const now = new Date().toTimeString().slice(0, 5);
    record.signOutTime = now;
    record.status = 'completed';

    const student = db.findStudentById(record.studentId);
    if (student) {
      student.completedHours += record.hours;

      const subjectProgress = student.subjects.find(s => s.subject === record.subject);
      if (subjectProgress) {
        subjectProgress.completedHours += record.hours;
        if (subjectProgress.completedHours >= subjectProgress.requiredHours) {
          subjectProgress.status = 'completed';
        }
      }
    }

    const coach = db.findCoachById(record.coachId);
    if (coach) {
      coach.totalHours += record.hours;
    }

    const studentUser = db.users.find(u => {
      const s = db.findStudentById(record.studentId);
      return s?.userId === u.id;
    });

    if (studentUser) {
      db.addMessage({
        userId: studentUser.id,
        type: 'training',
        title: '培训完成',
        content: `您已完成${record.subjectName}培训，本次学时：${record.hours}小时。`,
        relatedId: record.id,
        relatedType: 'training_record',
        hasAttachment: true,
      });
    }

    res.json({
      success: true,
      record,
      message: '签退成功',
    });
  } catch (error) {
    console.error('Training signout error:', error);
    res.status(500).json({
      success: false,
      message: '签退失败',
    });
  }
});

router.get('/hours/:studentId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { studentId } = req.params;
    const student = db.findStudentById(studentId);

    if (!student) {
      res.status(404).json({
        success: false,
        message: '学员不存在',
      });
      return;
    }

    const records = db.getTrainingRecordsByStudent(studentId);

    res.json({
      success: true,
      totalHours: student.completedHours,
      subjects: student.subjects,
      records,
    });
  } catch (error) {
    console.error('Get training hours error:', error);
    res.status(500).json({
      success: false,
      message: '获取学时信息失败',
    });
  }
});

export default router;

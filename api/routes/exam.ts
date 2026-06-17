import { Router, type Request, type Response } from 'express';
import { db } from '../data/db.js';
import type { ExamAppointment, ExamAppointmentRequest } from '../../shared/types';

const router = Router();

router.get('/rooms', async (req: Request, res: Response): Promise<void> => {
  try {
    const { subject } = req.query;

    let rooms = [...db.examRooms];

    if (subject) {
      rooms = rooms.filter(r => r.subject === subject);
    }

    res.json({
      success: true,
      rooms,
    });
  } catch (error) {
    console.error('Get exam rooms error:', error);
    res.status(500).json({
      success: false,
      message: '获取考场列表失败',
    });
  }
});

router.get('/appointments', async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, studentId } = req.query;

    let appointments = [...db.examAppointments];

    if (status) {
      appointments = appointments.filter(a => a.status === status);
    }

    if (studentId) {
      appointments = appointments.filter(a => a.studentId === studentId);
    }

    appointments.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

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

router.post('/appointments', async (req: Request, res: Response): Promise<void> => {
  try {
    const { studentId, subject, subjectName, examDate }: ExamAppointmentRequest & { subjectName: string } = req.body;

    const student = db.findStudentById(studentId);

    if (!student) {
      res.status(404).json({
        success: false,
        message: '学员不存在',
      });
      return;
    }

    const subjectProgress = student.subjects.find(s => s.subject === subject);

    if (!subjectProgress) {
      res.status(400).json({
        success: false,
        message: '科目不存在',
      });
      return;
    }

    if (subjectProgress.completedHours < subjectProgress.requiredHours) {
      res.status(400).json({
        success: false,
        message: `学时不足，当前已完成${subjectProgress.completedHours}小时，需要${subjectProgress.requiredHours}小时才能预约考试`,
      });
      return;
    }

    const availableRooms = db.examRooms.filter(
      r => r.subject === subject && r.status === 'active' && r.currentCount < r.capacity
    );

    if (availableRooms.length === 0) {
      res.status(400).json({
        success: false,
        message: '该科目暂无可用考场，请稍后再试',
      });
      return;
    }

    const examRoom = availableRooms[0];
    const examTime = `09:${String(examRoom.currentCount % 6 * 10).padStart(2, '0')}`;

    const ticketNumber = `KS${Date.now()}`;

    const newAppointment: ExamAppointment = {
      id: db.generateId('exam'),
      studentId,
      studentName: db.users.find(u => {
        const s = db.findStudentById(studentId);
        return s?.userId === u.id;
      })?.name || '',
      examRoomId: examRoom.id,
      examRoomName: examRoom.name,
      subject,
      subjectName,
      examDate,
      examTime,
      status: 'pending',
      ticketNumber,
      createdAt: new Date().toISOString(),
    };

    db.examAppointments.push(newAppointment);
    examRoom.currentCount += 1;

    const studentUser = db.users.find(u => student.userId === u.id);
    if (studentUser) {
      db.addMessage({
        userId: studentUser.id,
        type: 'exam',
        title: '考试预约提交成功',
        content: `您已成功提交${subjectName}考试预约申请，考试时间：${examDate} ${examTime}，考场：${examRoom.name}，等待审核。`,
        relatedId: newAppointment.id,
        relatedType: 'exam_appointment',
        hasAttachment: true,
      });
    }

    const examAdmins = db.users.filter(u => u.role === 'exam_admin');
    examAdmins.forEach(admin => {
      db.addMessage({
        userId: admin.id,
        type: 'exam',
        title: '新考试预约待审核',
        content: `学员${newAppointment.studentName}提交了${subjectName}考试预约申请，请及时审核。`,
        relatedId: newAppointment.id,
        relatedType: 'exam_appointment',
      });
    });

    res.json({
      success: true,
      appointment: newAppointment,
      message: '预约成功，请等待审核',
    });
  } catch (error) {
    console.error('Create exam appointment error:', error);
    res.status(500).json({
      success: false,
      message: '预约失败，请稍后重试',
    });
  }
});

router.put('/appointments/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, score } = req.body;

    const appointment = db.examAppointments.find(a => a.id === id);

    if (!appointment) {
      res.status(404).json({
        success: false,
        message: '考试预约不存在',
      });
      return;
    }

    appointment.status = status;

    if (score !== undefined) {
      appointment.score = score;
    }

    if (status === 'cancelled' && req.body.rejectReason) {
      appointment.rejectReason = req.body.rejectReason;
    }

    const studentUser = db.users.find(u => {
      const s = db.findStudentById(appointment.studentId);
      return s?.userId === u.id;
    });

    if (studentUser) {
      let title = '';
      let content = '';

      if (status === 'confirmed') {
        title = '考试预约审核通过';
        content = `您的${appointment.subjectName}考试预约已审核通过，考试时间：${appointment.examDate} ${appointment.examTime}，考场：${appointment.examRoomName}。`;
      } else if (status === 'passed') {
        title = '考试通过通知';
        content = `恭喜您通过了${appointment.subjectName}考试，成绩：${score}分！请继续下一科目的学习。`;

        const student = db.findStudentById(appointment.studentId);
        if (student) {
          const subjectProgress = student.subjects.find(s => s.subject === appointment.subject);
          if (subjectProgress) {
            subjectProgress.status = 'passed';
          }
        }
      } else if (status === 'failed') {
        title = '考试未通过通知';
        content = `很遗憾，您的${appointment.subjectName}考试未通过，成绩：${score}分。请加强练习后再次预约。`;
      } else if (status === 'cancelled') {
        const rejectReason = req.body.rejectReason || '';
        title = '考试预约被拒绝';
        if (rejectReason) {
          content = `您的${appointment.subjectName}考试预约已被拒绝取消。拒绝原因：${rejectReason}`;
        } else {
          content = `您的${appointment.subjectName}考试预约已取消。`;
        }
      }

      if (title && content) {
        db.addMessage({
          userId: studentUser.id,
          type: 'exam',
          title,
          content,
          relatedId: appointment.id,
          relatedType: 'exam_result',
          hasAttachment: true,
        });
      }
    }

    res.json({
      success: true,
      appointment,
      message: '更新成功',
    });
  } catch (error) {
    console.error('Update exam appointment error:', error);
    res.status(500).json({
      success: false,
      message: '更新失败',
    });
  }
});

export default router;

import { Router, type Request, type Response } from 'express';
import { db } from '../data/db.js';
import type { RefundRequest, RefundRequestData } from '../../shared/types';

const router = Router();

router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, studentId } = req.query;

    let requests = [...db.refundRequests];

    if (status) {
      requests = requests.filter(r => r.status === status);
    }

    if (studentId) {
      requests = requests.filter(r => r.studentId === studentId);
    }

    requests.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

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

router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { studentId, reason }: RefundRequestData = req.body;

    const student = db.findStudentById(studentId);

    if (!student) {
      res.status(404).json({
        success: false,
        message: '学员不存在',
      });
      return;
    }

    const existingRequest = db.refundRequests.find(
      r => r.studentId === studentId && r.status === 'pending'
    );

    if (existingRequest) {
      res.status(400).json({
        success: false,
        message: '您已有待审批的退费申请',
      });
      return;
    }

    const refundAmount = db.calculateRefund(student);

    const newRequest: RefundRequest = {
      id: db.generateId('refund'),
      studentId,
      studentName: db.users.find(u => student.userId === u.id)?.name || '',
      totalFee: student.totalFee,
      completedHours: student.completedHours,
      totalHours: student.totalHours,
      refundAmount,
      reason,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    db.refundRequests.push(newRequest);

    const financeUsers = db.users.filter(u => u.role === 'finance');
    financeUsers.forEach(finance => {
      db.addMessage({
        userId: finance.id,
        type: 'refund',
        title: '新退费申请待审批',
        content: `学员${newRequest.studentName}提交了退费申请，待审批金额：¥${refundAmount.toLocaleString()}.00，请及时处理。`,
        relatedId: newRequest.id,
        relatedType: 'refund_request',
      });
    });

    res.json({
      success: true,
      request: newRequest,
      message: '退费申请提交成功，请等待审批',
    });
  } catch (error) {
    console.error('Create refund request error:', error);
    res.status(500).json({
      success: false,
      message: '提交退费申请失败',
    });
  }
});

router.get('/calculate/:studentId', async (req: Request, res: Response): Promise<void> => {
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

    const refundAmount = db.calculateRefund(student);

    res.json({
      success: true,
      totalFee: student.totalFee,
      completedHours: student.completedHours,
      totalHours: student.totalHours,
      refundAmount,
    });
  } catch (error) {
    console.error('Calculate refund error:', error);
    res.status(500).json({
      success: false,
      message: '计算退款金额失败',
    });
  }
});

router.put('/:id/approve', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const request = db.refundRequests.find(r => r.id === id);

    if (!request) {
      res.status(404).json({
        success: false,
        message: '退费申请不存在',
      });
      return;
    }

    if (request.status !== 'pending') {
      res.status(400).json({
        success: false,
        message: '该申请已处理',
      });
      return;
    }

    request.status = 'approved';
    request.approvedAt = new Date().toISOString();

    const student = db.findStudentById(request.studentId);
    if (student) {
      student.status = 'refunded';

      const coach = db.findCoachById(student.coachId);
      if (coach && coach.currentStudents > 0) {
        coach.currentStudents -= 1;
      }
    }

    const studentUser = db.users.find(u => {
      const s = db.findStudentById(request.studentId);
      return s?.userId === u.id;
    });

    if (studentUser) {
      db.addMessage({
        userId: studentUser.id,
        type: 'refund',
        title: '退费申请已通过',
        content: `您的退费申请已审批通过，退款金额：¥${request.refundAmount.toLocaleString()}.00，预计3-5个工作日内到账。`,
        relatedId: request.id,
        relatedType: 'refund_result',
        hasAttachment: true,
      });
    }

    res.json({
      success: true,
      request,
      message: '审批通过，退款已安排',
    });
  } catch (error) {
    console.error('Approve refund error:', error);
    res.status(500).json({
      success: false,
      message: '审批失败',
    });
  }
});

router.put('/:id/reject', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { rejectReason } = req.body;

    const request = db.refundRequests.find(r => r.id === id);

    if (!request) {
      res.status(404).json({
        success: false,
        message: '退费申请不存在',
      });
      return;
    }

    if (request.status !== 'pending') {
      res.status(400).json({
        success: false,
        message: '该申请已处理',
      });
      return;
    }

    request.status = 'rejected';
    request.rejectReason = rejectReason;

    const studentUser = db.users.find(u => {
      const s = db.findStudentById(request.studentId);
      return s?.userId === u.id;
    });

    if (studentUser) {
      db.addMessage({
        userId: studentUser.id,
        type: 'refund',
        title: '退费申请被拒绝',
        content: `很遗憾，您的退费申请被拒绝，拒绝原因：${rejectReason || '不符合退费条件'}。`,
        relatedId: request.id,
        relatedType: 'refund_result',
        hasAttachment: true,
      });
    }

    res.json({
      success: true,
      request,
      message: '已拒绝申请',
    });
  } catch (error) {
    console.error('Reject refund error:', error);
    res.status(500).json({
      success: false,
      message: '操作失败',
    });
  }
});

export default router;

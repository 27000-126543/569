import { Router, type Request, type Response } from 'express';
import { db } from '../data/db.js';

const router = Router();

router.get('/:id/voucher', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const message = db.messages.find(m => m.id === id);

    if (!message) {
      res.status(404).json({
        success: false,
        message: '消息不存在',
      });
      return;
    }

    let content = '';
    let fileName = '';

    const user = db.users.find(u => u.id === message.userId);

    switch (message.relatedType) {
      case 'registration': {
        const student = db.findStudentById(message.relatedId || '');
        const coach = student ? db.findCoachById(student.coachId) : null;
        const coachUser = coach ? db.users.find(u => u.id === coach.userId) : null;

        fileName = `报名凭证_${user?.name || '学员'}.txt`;
        content = `
========================================
          驾校报名凭证
========================================

学员姓名：${user?.name || '---'}
学员手机号：${user?.phone || '---'}
身份证号：${student ? student.id : '---'}
驾照类型：${student?.licenseType || '---'}
报名日期：${student?.registerDate || '---'}
培训费用：¥${student?.totalFee?.toLocaleString() || '---'}
总学时：${student?.totalHours || '---'} 学时

分配教练：${coachUser?.name || '---'}
教练教龄：${coach?.experienceYears || '---'} 年
教练通过率：${coach?.passRate || '---'}%

培训科目：
  科目一 - 12学时
  科目二 - 16学时
  科目三 - 24学时
  科目四 - 10学时

凭证编号：${message.relatedId || '---'}
生成时间：${new Date().toLocaleString('zh-CN')}

========================================
  本凭证由系统自动生成，具有同等效力
========================================
`.trim();
        break;
      }

      case 'exam_appointment':
      case 'exam_result': {
        const appointment = db.examAppointments.find(a => a.id === message.relatedId);
        const student = appointment ? db.findStudentById(appointment.studentId) : null;
        const studentUser = student ? db.users.find(u => u.id === student.userId) : null;

        const isCancelled = appointment?.status === 'cancelled';
        fileName = `${isCancelled ? '考试预约取消凭证' : '考试准考证'}_${studentUser?.name || user?.name || '学员'}.txt`;
        content = `
========================================
      ${isCancelled ? '考试预约取消凭证' : '考试准考证'}
========================================

预约编号：${appointment?.id || '---'}
准考证号：${appointment?.ticketNumber || '---'}
学员姓名：${studentUser?.name || '---'}
学员身份证：${student?.id || '---'}

考试科目：${appointment?.subjectName || '---'}
考试日期：${appointment?.examDate || '---'}
考试时间：${appointment?.examTime || '---'}
考试场地：${appointment?.examRoomName || '---'}

预约状态：${
  appointment?.status === 'pending' ? '待审核' :
  appointment?.status === 'confirmed' ? '已确认' :
  appointment?.status === 'passed' ? '已通过' :
  appointment?.status === 'failed' ? '未通过' :
  appointment?.status === 'cancelled' ? '已取消' : '---'
}
${appointment?.rejectReason ? `拒绝原因：${appointment.rejectReason}` : ''}
${appointment?.score !== undefined ? `考试成绩：${appointment.score} 分` : ''}

${isCancelled ? '' : `注意事项：
  1. 请携带身份证原件准时参加考试
  2. 考试前30分钟到达考场签到
  3. 遵守考场纪律，服从监考人员安排
  4. 考试结束后凭准考证领取成绩单
`}

凭证编号：${appointment?.id || message.id}
生成时间：${new Date().toLocaleString('zh-CN')}

========================================
  本凭证由系统自动生成，具有同等效力
========================================
`.trim();
        break;
      }

      case 'refund':
      case 'refund_request':
      case 'refund_result': {
        const refund = db.refundRequests.find(r => r.id === message.relatedId);
        const student = refund ? db.findStudentById(refund.studentId) : null;
        const studentUser = student ? db.users.find(u => u.id === student.userId) : null;

        fileName = `退费审批凭证_${studentUser?.name || user?.name || '学员'}.txt`;
        content = `
========================================
          退费审批凭证
========================================

申请编号：${refund?.id || '---'}
学员姓名：${studentUser?.name || '---'}
学员手机号：${studentUser?.phone || '---'}
驾照类型：${student?.licenseType || '---'}

培训费用总额：¥${refund?.totalFee?.toLocaleString() || '---'}
已完成学时：${refund?.completedHours || '---'} / ${refund?.totalHours || '---'} 学时
学时完成比例：${refund ? Math.round((refund.completedHours / refund.totalHours) * 100) : 0}%

申请退费金额：¥${refund?.refundAmount?.toLocaleString() || '---'}
申请时间：${refund?.createdAt ? new Date(refund.createdAt).toLocaleString('zh-CN') : '---'}
退费原因：${refund?.reason || '---'}

审批结果：${
  refund?.status === 'pending' ? '待审批' :
  refund?.status === 'approved' ? '已通过' :
  refund?.status === 'rejected' ? '已拒绝' : '---'
}
${refund?.status === 'approved' ? `退款金额：¥${refund.refundAmount?.toLocaleString()}` : ''}
${refund?.approvedAt ? `审批时间：${new Date(refund.approvedAt).toLocaleString('zh-CN')}` : ''}
${refund?.status === 'rejected' && refund.rejectReason ? `拒绝原因：${refund.rejectReason}` : ''}

凭证编号：${refund?.id || message.id}
生成时间：${new Date().toLocaleString('zh-CN')}

========================================
  本凭证由系统自动生成，具有同等效力
========================================
`.trim();
        break;
      }

      case 'training_record': {
        const record = db.trainingRecords.find(r => r.id === message.relatedId);
        const student = record ? db.findStudentById(record.studentId) : null;
        const coach = record ? db.findCoachById(record.coachId) : null;
        const studentUser = student ? db.users.find(u => u.id === student.userId) : null;
        const coachUser = coach ? db.users.find(u => u.id === coach.userId) : null;

        fileName = `培训凭证_${user?.name || '学员'}.txt`;
        content = `
========================================
          培训学时凭证
========================================

学员姓名：${studentUser?.name || '---'}
教练姓名：${coachUser?.name || '---'}
培训科目：${record?.subjectName || '---'}

培训日期：${record?.trainingDate || '---'}
签到时间：${record?.signInTime || '---'}
${record?.signOutTime ? `签退时间：${record.signOutTime}` : ''}
培训时长：${record?.hours || '---'} 学时

培训状态：${record?.status === 'in_progress' ? '进行中' : '已完成'}

凭证编号：${record?.id || '---'}
生成时间：${new Date().toLocaleString('zh-CN')}

========================================
  本凭证由系统自动生成，具有同等效力
========================================
`.trim();
        break;
      }

      default: {
        fileName = `消息通知_${message.id}.txt`;
        content = `
========================================
          消息通知
========================================

消息标题：${message.title}
消息类型：${message.type}
消息内容：${message.content}
消息时间：${new Date(message.createdAt).toLocaleString('zh-CN')}

接收人：${user?.name || '---'}
接收人手机：${user?.phone || '---'}

凭证编号：${message.id}
生成时间：${new Date().toLocaleString('zh-CN')}

========================================
  本凭证由系统自动生成，具有同等效力
========================================
`.trim();
      }
    }

    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(fileName)}"`);
    res.send(content);
  } catch (error) {
    console.error('Get voucher error:', error);
    res.status(500).json({
      success: false,
      message: '生成凭证失败',
    });
  }
});

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

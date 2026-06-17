import { Router, type Request, type Response } from 'express';
import { db } from '../data/db.js';

const router = Router();

router.get('/overview', async (req: Request, res: Response): Promise<void> => {
  try {
    const totalStudents = db.students.length;
    const studyingStudents = db.students.filter(s => s.status === 'studying').length;
    const graduatedStudents = db.students.filter(s => s.status === 'graduated').length;
    const totalCoaches = db.coaches.length;
    const totalExamAppointments = db.examAppointments.length;
    const pendingExams = db.examAppointments.filter(e => e.status === 'pending' || e.status === 'confirmed').length;
    const passedExams = db.examAppointments.filter(e => e.status === 'passed').length;
    const totalRefundRequests = db.refundRequests.length;
    const pendingRefunds = db.refundRequests.filter(r => r.status === 'pending').length;
    const approvedRefunds = db.refundRequests.filter(r => r.status === 'approved').length;
    const totalRefundAmount = db.refundRequests
      .filter(r => r.status === 'approved')
      .reduce((sum, r) => sum + r.refundAmount, 0);

    const totalRevenue = db.students.reduce((sum, s) => sum + s.totalFee, 0);

    const avgPassRate =
      db.coaches.length > 0
        ? db.coaches.reduce((sum, c) => sum + c.passRate, 0) / db.coaches.length
        : 0;

    const today = new Date().toISOString().split('T')[0];
    const todayTrainingHours = db.trainingRecords
      .filter(r => r.trainingDate === today && r.status === 'completed')
      .reduce((sum, r) => sum + r.hours, 0);

    const todayNewStudents = db.students.filter(s => s.registerDate === today).length;

    res.json({
      success: true,
      overview: {
        totalStudents,
        studyingStudents,
        graduatedStudents,
        totalCoaches,
        totalExamAppointments,
        pendingExams,
        passedExams,
        totalRefundRequests,
        pendingRefunds,
        approvedRefunds,
        totalRefundAmount,
        totalRevenue,
        avgPassRate: Math.round(avgPassRate * 10) / 10,
        todayTrainingHours,
        todayNewStudents,
      },
    });
  } catch (error) {
    console.error('Get overview error:', error);
    res.status(500).json({
      success: false,
      message: '获取总览数据失败',
    });
  }
});

router.get('/coach-comparison', async (req: Request, res: Response): Promise<void> => {
  try {
    const stats = db.coachStats.map(stat => {
      const coach = db.findCoachById(stat.coachId);
      const coachUser = coach ? db.users.find(u => u.id === coach.userId) : null;
      return {
        ...stat,
        coachName: coachUser?.name || stat.coachName,
        experienceYears: coach?.experienceYears || 0,
      };
    });

    res.json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error('Get coach comparison error:', error);
    res.status(500).json({
      success: false,
      message: '获取教练对比数据失败',
    });
  }
});

router.get('/daily', async (req: Request, res: Response): Promise<void> => {
  try {
    const { date, days } = req.query;

    let reports = [...db.dailyReports];

    if (date) {
      reports = reports.filter(r => r.reportDate === date);
    }

    if (days) {
      const numDays = parseInt(days as string, 10);
      reports = reports.slice(0, numDays);
    }

    reports.sort((a, b) => new Date(b.reportDate).getTime() - new Date(a.reportDate).getTime());

    res.json({
      success: true,
      reports,
    });
  } catch (error) {
    console.error('Get daily reports error:', error);
    res.status(500).json({
      success: false,
      message: '获取日报数据失败',
    });
  }
});

router.get('/trends', async (req: Request, res: Response): Promise<void> => {
  try {
    const reports = [...db.dailyReports].sort(
      (a, b) => new Date(a.reportDate).getTime() - new Date(b.reportDate).getTime()
    );

    const studentTrend = reports.map(r => ({
      date: r.reportDate,
      newStudents: r.newStudents,
      totalStudents: r.newStudents + 100,
    }));

    const examTrend = reports.map(r => ({
      date: r.reportDate,
      appointments: r.examAppointmentCount,
      passRate: r.passRate,
    }));

    const revenueTrend = reports.map(r => ({
      date: r.reportDate,
      revenue: r.revenue,
      refund: r.refundAmount,
    }));

    res.json({
      success: true,
      trends: {
        studentTrend,
        examTrend,
        revenueTrend,
      },
    });
  } catch (error) {
    console.error('Get trends error:', error);
    res.status(500).json({
      success: false,
      message: '获取趋势数据失败',
    });
  }
});

export default router;

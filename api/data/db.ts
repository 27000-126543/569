import {
  mockUsers,
  mockCoaches,
  mockStudents,
  mockTrainingRecords,
  mockTrainingPlans,
  mockExamRooms,
  mockExamAppointments,
  mockRefundRequests,
  mockMessages,
  mockDailyReports,
  mockCoachStats,
  mockPasswords,
} from './mockData';
import type {
  User,
  Student,
  Coach,
  TrainingRecord,
  TrainingPlan,
  ExamRoom,
  ExamAppointment,
  RefundRequest,
  Message,
  DailyReport,
  CoachStats,
} from '../../shared/types';

class Database {
  users: User[] = [...mockUsers];
  coaches: Coach[] = [...mockCoaches];
  students: Student[] = [...mockStudents];
  trainingRecords: TrainingRecord[] = [...mockTrainingRecords];
  trainingPlans: TrainingPlan[] = [...mockTrainingPlans];
  examRooms: ExamRoom[] = [...mockExamRooms];
  examAppointments: ExamAppointment[] = [...mockExamAppointments];
  refundRequests: RefundRequest[] = [...mockRefundRequests];
  messages: Message[] = [...mockMessages];
  dailyReports: DailyReport[] = [...mockDailyReports];
  coachStats: CoachStats[] = [...mockCoachStats];
  passwords: Record<string, string> = { ...mockPasswords };

  generateId(prefix: string): string {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  findUserByUsername(username: string): User | undefined {
    return this.users.find(u => u.username === username);
  }

  findStudentById(id: string): Student | undefined {
    return this.students.find(s => s.id === id);
  }

  findStudentByUserId(userId: string): Student | undefined {
    return this.students.find(s => s.userId === userId);
  }

  findCoachById(id: string): Coach | undefined {
    return this.coaches.find(c => c.id === id);
  }

  findCoachByUserId(userId: string): Coach | undefined {
    return this.coaches.find(c => c.userId === userId);
  }

  getCoachStudents(coachId: string): Student[] {
    return this.students.filter(s => s.coachId === coachId);
  }

  getTrainingRecordsByStudent(studentId: string): TrainingRecord[] {
    return this.trainingRecords.filter(r => r.studentId === studentId);
  }

  getTrainingRecordsByCoach(coachId: string): TrainingRecord[] {
    return this.trainingRecords.filter(r => r.coachId === coachId);
  }

  getTrainingPlansByStudent(studentId: string): TrainingPlan[] {
    return this.trainingPlans.filter(p => p.studentId === studentId);
  }

  getTrainingPlansByCoach(coachId: string): TrainingPlan[] {
    return this.trainingPlans.filter(p => p.coachId === coachId);
  }

  getExamAppointmentsByStudent(studentId: string): ExamAppointment[] {
    return this.examAppointments.filter(a => a.studentId === studentId);
  }

  getRefundRequestsByStudent(studentId: string): RefundRequest[] {
    return this.refundRequests.filter(r => r.studentId === studentId);
  }

  getMessagesByUser(userId: string): Message[] {
    return this.messages
      .filter(m => m.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  getUnreadMessageCount(userId: string): number {
    return this.messages.filter(m => m.userId === userId && !m.isRead).length;
  }

  addMessage(message: Omit<Message, 'id' | 'createdAt' | 'isRead'> & Partial<Pick<Message, 'isRead'>>): Message {
    const newMessage: Message = {
      isRead: false,
      ...message,
      id: this.generateId('msg'),
      createdAt: new Date().toISOString(),
    };
    this.messages.unshift(newMessage);
    return newMessage;
  }

  markMessageRead(messageId: string): boolean {
    const message = this.messages.find(m => m.id === messageId);
    if (message) {
      message.isRead = true;
      return true;
    }
    return false;
  }

  matchCoach(licenseType: string, availableSlots: string[]): Coach | null {
    const matchingCoaches = this.coaches.filter(c => {
      if (c.licenseType !== licenseType) return false;
      if (c.currentStudents >= c.studentLimit) return false;
      const hasOverlap = c.availableSlots.some(slot =>
        availableSlots.includes(slot)
      );
      return hasOverlap;
    });

    if (matchingCoaches.length === 0) return null;

    matchingCoaches.sort((a, b) => {
      const loadA = a.currentStudents / a.studentLimit;
      const loadB = b.currentStudents / b.studentLimit;
      if (loadA !== loadB) return loadA - loadB;
      return b.passRate - a.passRate;
    });

    return matchingCoaches[0];
  }

  calculateRefund(student: Student): number {
    const hoursUsedRatio = student.completedHours / student.totalHours;
    const refundRatio = Math.max(0, 1 - hoursUsedRatio * 1.2);
    return Math.round(student.totalFee * refundRatio);
  }
}

export const db = new Database();

export type UserRole = 'student' | 'coach' | 'exam_admin' | 'finance' | 'principal';

export interface User {
  id: string;
  username: string;
  role: UserRole;
  name: string;
  phone: string;
  avatar?: string;
  createdAt: string;
}

export interface Student {
  id: string;
  userId: string;
  licenseType: string;
  status: 'studying' | 'graduated' | 'refunded';
  registerDate: string;
  coachId: string;
  totalFee: number;
  totalHours: number;
  completedHours: number;
  subjects: SubjectProgress[];
}

export interface SubjectProgress {
  subject: string;
  subjectName: string;
  requiredHours: number;
  completedHours: number;
  status: 'pending' | 'studying' | 'completed' | 'passed';
}

export interface Coach {
  id: string;
  userId: string;
  licenseType: string;
  experienceYears: number;
  studentLimit: number;
  currentStudents: number;
  passRate: number;
  totalHours: number;
  avatar?: string;
  availableSlots: string[];
}

export interface TrainingRecord {
  id: string;
  studentId: string;
  coachId: string;
  subject: string;
  subjectName: string;
  hours: number;
  trainingDate: string;
  signInTime: string;
  signOutTime?: string;
  status: 'in_progress' | 'completed';
}

export interface TrainingPlan {
  id: string;
  coachId: string;
  studentId: string;
  studentName: string;
  subject: string;
  subjectName: string;
  planDate: string;
  startTime: string;
  endTime: string;
  status: 'scheduled' | 'completed' | 'cancelled';
}

export interface ExamRoom {
  id: string;
  name: string;
  subject: string;
  capacity: number;
  currentCount: number;
  status: 'active' | 'inactive';
}

export interface ExamAppointment {
  id: string;
  studentId: string;
  studentName: string;
  examRoomId: string;
  examRoomName: string;
  subject: string;
  subjectName: string;
  examDate: string;
  examTime: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'passed' | 'failed';
  ticketNumber: string;
  score?: number;
  rejectReason?: string;
  createdAt: string;
}

export interface RefundRequest {
  id: string;
  studentId: string;
  studentName: string;
  totalFee: number;
  completedHours: number;
  totalHours: number;
  refundAmount: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  approvedAt?: string;
  rejectReason?: string;
}

export type MessageType = 'system' | 'exam' | 'refund' | 'training' | 'daily_report';

export interface Message {
  id: string;
  userId: string;
  type: MessageType;
  title: string;
  content: string;
  isRead: boolean;
  relatedId?: string;
  relatedType?: string;
  hasAttachment?: boolean;
  createdAt: string;
}

export interface DailyReport {
  id: string;
  reportDate: string;
  totalTrainingHours: number;
  examAppointmentCount: number;
  refundRequestCount: number;
  refundAmount: number;
  newStudents: number;
  passRate: number;
  revenue: number;
  createdAt: string;
}

export interface CoachStats {
  coachId: string;
  coachName: string;
  totalStudents: number;
  passRate: number;
  refundRate: number;
  totalHours: number;
  avgRating: number;
}

export interface LoginRequest {
  username: string;
  password: string;
  role: UserRole;
}

export interface LoginResponse {
  success: boolean;
  user: User;
  token: string;
}

export interface RegisterRequest {
  name: string;
  phone: string;
  idCard: string;
  licenseType: string;
  availableSlots: string[];
}

export interface RegisterResponse {
  success: boolean;
  student: Student;
  matchedCoach: Coach;
  message: string;
}

export interface ExamAppointmentRequest {
  studentId: string;
  subject: string;
  examDate: string;
}

export interface RefundRequestData {
  studentId: string;
  reason: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

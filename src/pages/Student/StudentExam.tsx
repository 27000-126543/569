import { useState, useEffect } from 'react';
import Layout from '../../components/Layout/Layout';
import {
  FileText,
  Calendar,
  Clock,
  MapPin,
  CheckCircle,
  AlertCircle,
  Loader2,
  Download,
} from 'lucide-react';
import { useAuthStore } from '../../store/useStore';
import api from '../../utils/api';
import type { ExamAppointment } from '../../../shared/types';

export default function StudentExam() {
  const { student, user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'appointment' | 'history'>('appointment');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [appointments, setAppointments] = useState<ExamAppointment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showTicket, setShowTicket] = useState<ExamAppointment | null>(null);

  useEffect(() => {
    if (student) {
      fetchAppointments();
    }
  }, [student]);

  const fetchAppointments = async () => {
    try {
      const response = await api.get<any>(
        `/students/${student?.id}/exam-appointments`
      );
      if (response.success) {
        setAppointments(response.appointments || []);
      }
    } catch (error) {
      console.error('Fetch exam appointments error:', error);
    }
  };

  const canAppoint = (subject: string) => {
    const subjectInfo = student?.subjects.find((s) => s.subject === subject);
    if (!subjectInfo) return false;
    return subjectInfo.completedHours >= subjectInfo.requiredHours;
  };

  const isAppointed = (subject: string) => {
    return appointments.some(
      (a) =>
        a.subject === subject &&
        (a.status === 'pending' || a.status === 'confirmed')
    );
  };

  const handleAppointment = async () => {
    if (!selectedSubject || !selectedDate) {
      setMessage({ type: 'error', text: '请选择科目和考试日期' });
      return;
    }

    if (!canAppoint(selectedSubject)) {
      setMessage({ type: 'error', text: '学时不足，无法预约考试' });
      return;
    }

    setIsLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const subjectName =
        student?.subjects.find((s) => s.subject === selectedSubject)
          ?.subjectName || '';

      const response = await api.post<any>('/exam/appointments', {
        studentId: student?.id,
        subject: selectedSubject,
        subjectName,
        examDate: selectedDate,
      });

      if (response.success) {
        setMessage({ type: 'success', text: '预约成功！请等待审核' });
        fetchAppointments();
        setSelectedSubject('');
        setSelectedDate('');
      } else {
        setMessage({ type: 'error', text: response.message || '预约失败' });
      }
    } catch (error) {
      console.error('Exam appointment error:', error);
      setMessage({ type: 'error', text: '预约失败，请稍后重试' });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-blue-100 text-blue-600';
      case 'passed':
        return 'bg-emerald-100 text-emerald-600';
      case 'failed':
        return 'bg-rose-100 text-rose-600';
      case 'pending':
        return 'bg-amber-100 text-amber-600';
      default:
        return 'bg-slate-100 text-slate-600';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed':
        return '已确认';
      case 'passed':
        return '已通过';
      case 'failed':
        return '未通过';
      case 'pending':
        return '待审核';
      case 'cancelled':
        return '已取消';
      default:
        return status;
    }
  };

  const subjects = student?.subjects || [];
  const upcomingExams = appointments.filter(
    (a) => a.status === 'pending' || a.status === 'confirmed'
  );
  const historyExams = appointments.filter(
    (a) => a.status === 'passed' || a.status === 'failed' || a.status === 'cancelled'
  );

  const generateDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 3; i <= 14; i++) {
      const date = new Date(today.getTime() + 86400000 * i);
      dates.push(date.toISOString().split('T')[0]);
    }
    return dates;
  };

  return (
    <Layout role="student" title="考试预约">
      <div className="space-y-6">
        <div className="bg-white rounded-xl border border-slate-100 p-6">
          <div className="flex gap-4 border-b border-slate-100 mb-6">
            <button
              onClick={() => setActiveTab('appointment')}
              className={`pb-3 px-2 font-medium transition-colors relative ${
                activeTab === 'appointment'
                  ? 'text-blue-600'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              预约考试
              {activeTab === 'appointment' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`pb-3 px-2 font-medium transition-colors relative ${
                activeTab === 'history'
                  ? 'text-blue-600'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              考试记录
              {activeTab === 'history' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
              )}
            </button>
          </div>

          {activeTab === 'appointment' && (
            <div>
              {upcomingExams.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-medium text-slate-800 mb-3">待参加考试</h4>
                  <div className="space-y-3">
                    {upcomingExams.map((exam) => (
                      <div
                        key={exam.id}
                        className="flex items-center justify-between p-4 bg-blue-50 rounded-lg"
                      >
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-blue-100 rounded-xl">
                            <FileText className="w-6 h-6 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium text-slate-800">
                              {exam.subjectName}
                            </p>
                            <p className="text-sm text-slate-500">
                              {exam.examDate} {exam.examTime} · {exam.examRoomName}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span
                            className={`px-3 py-1 text-sm rounded-full ${getStatusColor(
                              exam.status
                            )}`}
                          >
                            {getStatusText(exam.status)}
                          </span>
                          {exam.status === 'confirmed' && (
                            <button
                              onClick={() => setShowTicket(exam)}
                              className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 flex items-center gap-2"
                            >
                              <Download className="w-4 h-4" />
                              准考证
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <h4 className="font-medium text-slate-800 mb-4">选择科目</h4>
              <div className="grid grid-cols-4 gap-4 mb-6">
                {subjects.map((subject) => {
                  const disabled = !canAppoint(subject.subject);
                  const appointed = isAppointed(subject.subject);
                  const isSelected = selectedSubject === subject.subject;

                  return (
                    <button
                      key={subject.subject}
                      onClick={() => {
                        if (!disabled && !appointed) {
                          setSelectedSubject(subject.subject);
                        }
                      }}
                      disabled={disabled || appointed}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50'
                          : disabled || appointed
                          ? 'border-slate-100 bg-slate-50 opacity-60 cursor-not-allowed'
                          : 'border-slate-200 hover:border-blue-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-slate-800">
                          {subject.subjectName}
                        </span>
                        {appointed ? (
                          <span className="text-xs text-amber-600 bg-amber-100 px-2 py-0.5 rounded">
                            已预约
                          </span>
                        ) : disabled ? (
                          <AlertCircle className="w-4 h-4 text-amber-500" />
                        ) : isSelected ? (
                          <CheckCircle className="w-5 h-5 text-blue-600" />
                        ) : null}
                      </div>
                      <p className="text-sm text-slate-500">
                        {subject.completedHours}/{subject.requiredHours} 学时
                      </p>
                      <div className="mt-2 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            canAppoint(subject.subject)
                              ? 'bg-emerald-500'
                              : 'bg-amber-500'
                          }`}
                          style={{
                            width: `${Math.min(
                              (subject.completedHours / subject.requiredHours) *
                                100,
                              100
                            )}%`,
                          }}
                        />
                      </div>
                    </button>
                  );
                })}
              </div>

              {selectedSubject && (
                <div className="animate-fade-in">
                  <h4 className="font-medium text-slate-800 mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    选择考试日期
                  </h4>
                  <div className="grid grid-cols-4 gap-3 mb-6">
                    {generateDates().map((date) => {
                      const isSelected = selectedDate === date;
                      const dateObj = new Date(date);
                      const dayNames = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

                      return (
                        <button
                          key={date}
                          onClick={() => setSelectedDate(date)}
                          className={`p-3 rounded-lg border-2 text-center transition-all ${
                            isSelected
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-slate-200 hover:border-blue-300'
                          }`}
                        >
                          <p className="font-medium text-slate-800">
                            {dateObj.getMonth() + 1}月{dateObj.getDate()}日
                          </p>
                          <p className="text-sm text-slate-500">
                            {dayNames[dateObj.getDay()]}
                          </p>
                        </button>
                      );
                    })}
                  </div>

                  {message.text && (
                    <div
                      className={`p-4 rounded-lg mb-4 ${
                        message.type === 'success'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-rose-50 text-rose-700'
                      }`}
                    >
                      {message.text}
                    </div>
                  )}

                  <button
                    onClick={handleAppointment}
                    disabled={isLoading || !selectedDate}
                    className="w-full py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        预约中...
                      </>
                    ) : (
                      '确认预约'
                    )}
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'history' && (
            <div>
              {historyExams.length > 0 ? (
                <div className="space-y-3">
                  {historyExams.map((exam) => (
                    <div
                      key={exam.id}
                      className="flex items-center justify-between p-4 border border-slate-100 rounded-lg hover:border-slate-200 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`p-3 rounded-xl ${
                            exam.status === 'passed'
                              ? 'bg-emerald-100'
                              : exam.status === 'failed'
                              ? 'bg-rose-100'
                              : 'bg-slate-100'
                          }`}
                        >
                          <FileText
                            className={`w-6 h-6 ${
                              exam.status === 'passed'
                                ? 'text-emerald-600'
                                : exam.status === 'failed'
                                ? 'text-rose-600'
                                : 'text-slate-600'
                            }`}
                          />
                        </div>
                        <div>
                          <p className="font-medium text-slate-800">
                            {exam.subjectName}
                          </p>
                          <p className="text-sm text-slate-500 flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            {exam.examDate}
                            <MapPin className="w-4 h-4 ml-2" />
                            {exam.examRoomName}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        {exam.score !== undefined && (
                          <div className="text-right">
                            <p className="text-2xl font-bold text-slate-800">
                              {exam.score}
                              <span className="text-sm font-normal text-slate-500">分</span>
                            </p>
                          </div>
                        )}
                        <span
                          className={`px-3 py-1 text-sm rounded-full ${getStatusColor(
                            exam.status
                          )}`}
                        >
                          {getStatusText(exam.status)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-slate-400">
                  <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>暂无考试记录</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {showTicket && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-slate-800 text-center mb-6">
              📄 电子准考证
            </h3>

            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border-2 border-dashed border-blue-200">
              <div className="text-center mb-6">
                <p className="text-sm text-slate-500 mb-1">准考证号</p>
                <p className="text-2xl font-bold text-blue-600 font-mono">
                  {showTicket.ticketNumber}
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-500">考生姓名</span>
                  <span className="font-medium text-slate-800">
                    {showTicket.studentName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">考试科目</span>
                  <span className="font-medium text-slate-800">
                    {showTicket.subjectName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">考试日期</span>
                  <span className="font-medium text-slate-800">
                    {showTicket.examDate}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">考试时间</span>
                  <span className="font-medium text-slate-800">
                    {showTicket.examTime}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">考试场地</span>
                  <span className="font-medium text-slate-800">
                    {showTicket.examRoomName}
                  </span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-blue-200">
                <p className="text-xs text-slate-500 text-center">
                  请携带身份证提前30分钟到达考场
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowTicket(null)}
                className="flex-1 py-3 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50"
              >
                关闭
              </button>
              <button className="flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2">
                <Download className="w-4 h-4" />
                下载凭证
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

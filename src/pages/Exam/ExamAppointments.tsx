import { useState, useEffect } from 'react';
import Layout from '../../components/Layout/Layout';
import {
  CalendarCheck,
  Search,
  CheckCircle,
  XCircle,
  FileText,
  Clock,
  RefreshCw,
} from 'lucide-react';
import api from '../../utils/api';
import type { ExamAppointment } from '../../../shared/types';

export default function ExamAppointments() {
  const [appointments, setAppointments] = useState<ExamAppointment[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<ExamAppointment | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    fetchAppointments();
  }, [filter]);

  const fetchAppointments = async () => {
    setIsLoading(true);
    try {
      const url = filter === 'all'
        ? '/exam/appointments'
        : `/exam/appointments?status=${filter}`;
      const response = await api.get<any>(url);
      if (response.success) {
        setAppointments(response.appointments || []);
      }
    } catch (error) {
      console.error('Fetch appointments error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      const response = await api.put<any>(`/exam/appointments/${id}`, {
        status: 'confirmed',
      });
      if (response.success) {
        fetchAppointments();
      }
    } catch (error) {
      console.error('Approve appointment error:', error);
    }
  };

  const handleRejectClick = (appointment: ExamAppointment) => {
    setSelectedAppointment(appointment);
    setRejectReason('');
    setRejectModalOpen(true);
  };

  const handleRejectConfirm = async () => {
    if (!selectedAppointment) return;

    try {
      const response = await api.put<any>(`/exam/appointments/${selectedAppointment.id}`, {
        status: 'cancelled',
        rejectReason,
      });
      if (response.success) {
        setRejectModalOpen(false);
        setSelectedAppointment(null);
        setRejectReason('');
        fetchAppointments();
      }
    } catch (error) {
      console.error('Reject appointment error:', error);
    }
  };

  const handleResult = async (id: string, passed: boolean, score: number) => {
    try {
      const response = await api.put<any>(`/exam/appointments/${id}`, {
        status: passed ? 'passed' : 'failed',
        score,
      });
      if (response.success) {
        fetchAppointments();
      }
    } catch (error) {
      console.error('Update result error:', error);
    }
  };

  const filteredAppointments = appointments.filter((a) =>
    a.studentName.includes(searchQuery) || a.ticketNumber.includes(searchQuery)
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-blue-100 text-blue-600';
      case 'pending':
        return 'bg-amber-100 text-amber-600';
      case 'passed':
        return 'bg-emerald-100 text-emerald-600';
      case 'failed':
        return 'bg-rose-100 text-rose-600';
      case 'cancelled':
        return 'bg-slate-100 text-slate-600';
      case 'completed':
        return 'bg-green-100 text-green-600';
      default:
        return 'bg-slate-100 text-slate-600';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed':
        return '已确认';
      case 'pending':
        return '待审核';
      case 'passed':
        return '已通过';
      case 'failed':
        return '未通过';
      case 'cancelled':
        return '已取消';
      default:
        return status;
    }
  };

  return (
    <Layout role="exam_admin" title="预约管理">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            {(['all', 'pending', 'confirmed', 'completed'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === f
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                }`}
              >
                {f === 'all'
                  ? '全部'
                  : f === 'pending'
                  ? '待审核'
                  : f === 'confirmed'
                  ? '已确认'
                  : '已完成'}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜索学员姓名/准考证号"
                className="pl-10 pr-4 py-2 w-64 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={fetchAppointments}
              className="p-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50"
              title="刷新"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">
                  准考证号
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">
                  学员
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">
                  科目
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">
                  考试时间
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">
                  考场
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">
                  状态
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">
                  操作
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-8 h-8 mx-auto mb-2 animate-spin opacity-50" />
                    <p>加载中...</p>
                  </td>
                </tr>
              ) : filteredAppointments.length > 0 ? (
                filteredAppointments.map((appointment) => (
                  <tr
                    key={appointment.id}
                    className="border-b border-slate-50 hover:bg-slate-50"
                  >
                    <td className="py-4 px-4">
                      <span className="font-mono text-sm text-blue-600">
                        {appointment.ticketNumber}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-sm font-medium">
                          {appointment.studentName.charAt(0)}
                        </div>
                        <span className="font-medium text-slate-800">
                          {appointment.studentName}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-sm text-slate-800">
                      {appointment.subjectName}
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-sm">
                        <p className="text-slate-800">{appointment.examDate}</p>
                        <p className="text-slate-500 text-xs">{appointment.examTime}</p>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-sm text-slate-600">
                      {appointment.examRoomName}
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${getStatusColor(
                          appointment.status
                        )}`}
                      >
                        {getStatusText(appointment.status)}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex gap-2">
                        {appointment.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApprove(appointment.id)}
                              className="px-2 py-1 text-xs text-emerald-600 hover:bg-emerald-50 rounded flex items-center gap-1"
                              title="通过"
                            >
                              <CheckCircle className="w-4 h-4" />
                              通过
                            </button>
                            <button
                              onClick={() => handleRejectClick(appointment)}
                              className="px-2 py-1 text-xs text-rose-600 hover:bg-rose-50 rounded flex items-center gap-1"
                              title="拒绝"
                            >
                              <XCircle className="w-4 h-4" />
                              拒绝
                            </button>
                          </>
                        )}
                        {appointment.status === 'confirmed' && (
                          <>
                            <button
                              onClick={() => handleResult(appointment.id, true, 90)}
                              className="px-2 py-1 text-xs text-emerald-600 hover:bg-emerald-50 rounded"
                            >
                              通过
                            </button>
                            <button
                              onClick={() => handleResult(appointment.id, false, 70)}
                              className="px-2 py-1 text-xs text-rose-600 hover:bg-rose-50 rounded"
                            >
                              未通过
                            </button>
                          </>
                        )}
                        <button
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                          title="查看详情"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>暂无预约记录</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {rejectModalOpen && selectedAppointment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 animate-fade-in">
            <h3 className="text-xl font-bold text-slate-800 mb-2">拒绝考试预约</h3>
            <p className="text-slate-600 mb-4">
              学员 <strong>{selectedAppointment.studentName}</strong> 的
              <strong> {selectedAppointment.subjectName} </strong>
              考试预约
            </p>
            <p className="text-sm text-slate-500 mb-3">
              请填写拒绝原因（系统将通知学员）：
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="请输入拒绝原因..."
              rows={4}
              className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent resize-none"
            />
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setRejectModalOpen(false);
                  setSelectedAppointment(null);
                  setRejectReason('');
                }}
                className="flex-1 py-3 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50"
              >
                取消
              </button>
              <button
                onClick={handleRejectConfirm}
                disabled={!rejectReason.trim()}
                className="flex-1 py-3 bg-rose-600 text-white rounded-lg hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                确认拒绝
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

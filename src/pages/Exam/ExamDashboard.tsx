import { useState, useEffect } from 'react';
import Layout from '../../components/Layout/Layout';
import StatCard from '../../components/Card/StatCard';
import {
  DoorOpen,
  Users,
  Clock,
  FileCheck,
  CalendarCheck,
  CheckCircle,
  XCircle,
  Search,
} from 'lucide-react';
import api from '../../utils/api';
import type { ExamAppointment, ExamRoom } from '../../../shared/types';

export default function ExamDashboard() {
  const [rooms, setRooms] = useState<ExamRoom[]>([]);
  const [appointments, setAppointments] = useState<ExamAppointment[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchRooms();
    fetchAppointments();
  }, []);

  const fetchRooms = async () => {
    try {
      const response = await api.get<any>('/exam/rooms');
      if (response.success) {
        setRooms(response.rooms || []);
      }
    } catch (error) {
      console.error('Fetch rooms error:', error);
    }
  };

  const fetchAppointments = async () => {
    try {
      const response = await api.get<any>('/exam/appointments?status=pending');
      if (response.success) {
        setAppointments(response.appointments || []);
      }
    } catch (error) {
      console.error('Fetch appointments error:', error);
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

  const handleReject = async (id: string) => {
    try {
      const response = await api.put<any>(`/exam/appointments/${id}`, {
        status: 'cancelled',
      });
      if (response.success) {
        fetchAppointments();
      }
    } catch (error) {
      console.error('Reject appointment error:', error);
    }
  };

  const pendingCount = appointments.filter((a) => a.status === 'pending').length;
  const totalCapacity = rooms.reduce((sum, r) => sum + r.capacity, 0);
  const currentCount = rooms.reduce((sum, r) => sum + r.currentCount, 0);

  return (
    <Layout role="exam_admin" title="考场首页">
      <div className="space-y-6">
        <div className="grid grid-cols-4 gap-4">
          <StatCard
            title="考场数量"
            value={rooms.length}
            icon={DoorOpen}
            color="blue"
          />
          <StatCard
            title="总容量"
            value={totalCapacity}
            icon={Users}
            color="green"
          />
          <StatCard
            title="今日考试"
            value={currentCount}
            icon={CalendarCheck}
            color="amber"
          />
          <StatCard
            title="待审核预约"
            value={pendingCount}
            icon={FileCheck}
            color="purple"
          />
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-slate-100 p-5">
            <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <DoorOpen className="w-5 h-5 text-blue-600" />
              考场状态
            </h3>
            <div className="space-y-3">
              {rooms.map((room) => {
                const usageRate = Math.round(
                  (room.currentCount / room.capacity) * 100
                );
                return (
                  <div
                    key={room.id}
                    className="p-4 bg-slate-50 rounded-lg"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <span className="font-medium text-slate-800">
                          {room.name}
                        </span>
                        <span className="ml-2 text-sm text-slate-500">
                          {room.subject === 'subject-1'
                            ? '科目一'
                            : room.subject === 'subject-2'
                            ? '科目二'
                            : room.subject === 'subject-3'
                            ? '科目三'
                            : '科目四'}
                        </span>
                      </div>
                      <span
                        className={`px-2 py-0.5 text-xs rounded-full ${
                          room.status === 'active'
                            ? 'bg-emerald-100 text-emerald-600'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {room.status === 'active' ? '运行中' : '已关闭'}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            usageRate > 80
                              ? 'bg-rose-500'
                              : usageRate > 50
                              ? 'bg-amber-500'
                              : 'bg-emerald-500'
                          }`}
                          style={{ width: `${usageRate}%` }}
                        />
                      </div>
                      <span className="text-sm text-slate-600">
                        {room.currentCount}/{room.capacity}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-amber-500" />
                待审核预约
              </h3>
              <span className="px-2 py-1 text-xs bg-amber-100 text-amber-600 rounded-full">
                {pendingCount} 条
              </span>
            </div>

            {pendingCount > 0 ? (
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {appointments
                  .filter((a) => a.status === 'pending')
                  .slice(0, 5)
                  .map((appointment) => (
                    <div
                      key={appointment.id}
                      className="p-4 border border-slate-100 rounded-lg hover:border-blue-200 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <span className="font-medium text-slate-800">
                            {appointment.studentName}
                          </span>
                          <span className="ml-2 text-sm text-blue-600">
                            {appointment.subjectName}
                          </span>
                        </div>
                        <span className="text-xs text-slate-500">
                          {appointment.examDate}
                        </span>
                      </div>
                      <p className="text-sm text-slate-500 mb-3">
                        {appointment.examTime} · {appointment.examRoomName}
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApprove(appointment.id)}
                          className="flex-1 py-2 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700 flex items-center justify-center gap-1"
                        >
                          <CheckCircle className="w-4 h-4" />
                          通过
                        </button>
                        <button
                          onClick={() => handleReject(appointment.id)}
                          className="flex-1 py-2 bg-rose-100 text-rose-600 text-sm rounded-lg hover:bg-rose-200 flex items-center justify-center gap-1"
                        >
                          <XCircle className="w-4 h-4" />
                          拒绝
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-12 text-slate-400">
                <FileCheck className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>暂无待审核预约</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

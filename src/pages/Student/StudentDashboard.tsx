import { useEffect, useState } from 'react';
import Layout from '../../components/Layout/Layout';
import StatCard from '../../components/Card/StatCard';
import {
  GraduationCap,
  Clock,
  FileText,
  Bell,
  CalendarClock,
  ChevronRight,
  UserPlus,
  Wallet,
} from 'lucide-react';
import { useAuthStore } from '../../store/useStore';
import api from '../../utils/api';
import { Link } from 'react-router-dom';
import type { TrainingPlan, Message } from '../../../shared/types';

export default function StudentDashboard() {
  const { student, user } = useAuthStore();
  const [plans, setPlans] = useState<TrainingPlan[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    if (student) {
      fetchTrainingPlans();
      fetchMessages();
    }
  }, [student]);

  const fetchTrainingPlans = async () => {
    try {
      const response = await api.get<any>(`/students/${student?.id}/training-plans`);
      if (response.success) {
        setPlans(response.plans.slice(0, 3));
      }
    } catch (error) {
      console.error('Fetch training plans error:', error);
    }
  };

  const fetchMessages = async () => {
    try {
      const response = await api.get<any>(`/messages?userId=${user?.id}&type=all`);
      if (response.success) {
        setMessages(response.messages.slice(0, 3));
      }
    } catch (error) {
      console.error('Fetch messages error:', error);
    }
  };

  const progress = student
    ? Math.round((student.completedHours / student.totalHours) * 100)
    : 0;

  const pendingExams = student?.subjects.filter(
    (s) => s.status === 'completed' || s.status === 'studying'
  ).length || 0;

  return (
    <Layout role="student" title="学员首页">
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">欢迎回来，{user?.name}！</h2>
              <p className="text-blue-100 mt-1">
                祝您学习顺利，早日拿证 🎉
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-blue-100">培训进度</p>
              <p className="text-3xl font-bold">{progress}%</p>
            </div>
          </div>
          <div className="mt-4">
            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-sm text-blue-100 mt-2">
              已完成 {student?.completedHours}/{student?.totalHours} 学时
            </p>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <StatCard
            title="培训进度"
            value={`${progress}%`}
            icon={GraduationCap}
            color="blue"
            trend="5% 较上周"
            trendUp
          />
          <StatCard
            title="已完成学时"
            value={`${student?.completedHours || 0}h`}
            icon={Clock}
            color="green"
          />
          <StatCard
            title="待考科目"
            value={pendingExams}
            icon={FileText}
            color="amber"
          />
          <StatCard
            title="未读消息"
            value={3}
            icon={Bell}
            color="purple"
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Link
            to="/student/register"
            className="bg-white rounded-xl p-5 border border-slate-100 hover:shadow-md hover:border-blue-200 transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                <UserPlus className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-800 group-hover:text-blue-600 transition-colors">
                  在线报名
                </h3>
                <p className="text-sm text-slate-500">快速报名，智能匹配教练</p>
              </div>
            </div>
          </Link>

          <Link
            to="/student/exam"
            className="bg-white rounded-xl p-5 border border-slate-100 hover:shadow-md hover:border-emerald-200 transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-800 group-hover:text-emerald-600 transition-colors">
                  考试预约
                </h3>
                <p className="text-sm text-slate-500">学时达标即可预约</p>
              </div>
            </div>
          </Link>

          <Link
            to="/student/refund"
            className="bg-white rounded-xl p-5 border border-slate-100 hover:shadow-md hover:border-amber-200 transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                <Wallet className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-800 group-hover:text-amber-600 transition-colors">
                  退费申请
                </h3>
                <p className="text-sm text-slate-500">按学时自动计算退费</p>
              </div>
            </div>
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-slate-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                <CalendarClock className="w-5 h-5 text-blue-600" />
                近期培训计划
              </h3>
              <Link
                to="/student/training"
                className="text-sm text-blue-600 hover:text-blue-700 flex items-center"
              >
                查看全部
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="space-y-3">
              {plans.length > 0 ? (
                plans.map((plan) => (
                  <div
                    key={plan.id}
                    className="flex items-center gap-4 p-3 bg-slate-50 rounded-lg"
                  >
                    <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center text-sm font-medium">
                      {plan.startTime}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-slate-800">
                        {plan.subjectName}
                      </p>
                      <p className="text-sm text-slate-500">
                        {plan.planDate} · {plan.startTime}-{plan.endTime}
                      </p>
                    </div>
                    <span className="px-2 py-1 text-xs bg-blue-100 text-blue-600 rounded">
                      待上课
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-slate-400">
                  暂无培训计划
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                <Bell className="w-5 h-5 text-amber-500" />
                最新消息
              </h3>
              <Link
                to="/student/messages"
                className="text-sm text-blue-600 hover:text-blue-700 flex items-center"
              >
                查看全部
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="space-y-3">
              {messages.length > 0 ? (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      msg.isRead ? 'bg-slate-50' : 'bg-blue-50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {!msg.isRead && (
                        <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className={`font-medium ${msg.isRead ? 'text-slate-600' : 'text-slate-800'}`}>
                          {msg.title}
                        </p>
                        <p className="text-sm text-slate-500 truncate mt-1">
                          {msg.content}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-slate-400">
                  暂无消息
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

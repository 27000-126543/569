import { useEffect, useState } from 'react';
import Layout from '../../components/Layout/Layout';
import StatCard from '../../components/Card/StatCard';
import {
  Clock,
  Users,
  TrendingUp,
  QrCode,
  Calendar,
  CheckCircle,
  BarChart3,
} from 'lucide-react';
import { useAuthStore } from '../../store/useStore';
import api from '../../utils/api';
import { Link } from 'react-router-dom';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { Student as StudentType, TrainingPlan } from '../../../shared/types';

const weeklyData = [
  { day: '周一', hours: 6 },
  { day: '周二', hours: 8 },
  { day: '周三', hours: 4 },
  { day: '周四', hours: 7 },
  { day: '周五', hours: 5 },
  { day: '周六', hours: 10 },
  { day: '周日', hours: 6 },
];

export default function CoachDashboard() {
  const { coach, user } = useAuthStore();
  const [students, setStudents] = useState<StudentType[]>([]);
  const [todayPlans, setTodayPlans] = useState<TrainingPlan[]>([]);

  useEffect(() => {
    if (coach) {
      fetchStudents();
      fetchTodayPlans();
    }
  }, [coach]);

  const fetchStudents = async () => {
    try {
      const response = await api.get<any>(`/coaches/${coach?.id}/students`);
      if (response.success) {
        setStudents(response.students || []);
      }
    } catch (error) {
      console.error('Fetch students error:', error);
    }
  };

  const fetchTodayPlans = async () => {
    try {
      const response = await api.get<any>(`/coaches/${coach?.id}/training-plans`);
      if (response.success) {
        const today = new Date().toISOString().split('T')[0];
        const todayList = (response.plans || []).filter(
          (p: TrainingPlan) => p.planDate === today
        );
        setTodayPlans(todayList);
      }
    } catch (error) {
      console.error('Fetch training plans error:', error);
    }
  };

  return (
    <Layout role="coach" title="教练首页">
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">您好，{user?.name}！</h2>
              <p className="text-emerald-100 mt-1">
                今天有 {todayPlans.length} 节课程，加油！💪
              </p>
            </div>
            <Link
              to="/coach/signin"
              className="px-6 py-3 bg-white text-emerald-600 font-semibold rounded-xl hover:bg-emerald-50 transition-colors flex items-center gap-2"
            >
              <QrCode className="w-5 h-5" />
              扫码签到
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <StatCard
            title="今日课时"
            value={`${todayPlans.length * 2}h`}
            icon={Clock}
            color="blue"
          />
          <StatCard
            title="累计课时"
            value={`${coach?.totalHours || 0}h`}
            icon={TrendingUp}
            color="green"
            trend="12h 较上周"
            trendUp
          />
          <StatCard
            title="学员人数"
            value={coach?.currentStudents || 0}
            icon={Users}
            color="amber"
          />
          <StatCard
            title="考试通过率"
            value={`${coach?.passRate || 0}%`}
            icon={CheckCircle}
            color="purple"
          />
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 bg-white rounded-xl border border-slate-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                本周课时统计
              </h3>
              <Link
                to="/coach/statistics"
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                查看详情 →
              </Link>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} />
                  <YAxis stroke="#94a3b8" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="hours" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-emerald-600" />
                今日课程
              </h3>
              <span className="text-sm text-slate-500">
                {todayPlans.length} 节
              </span>
            </div>

            {todayPlans.length > 0 ? (
              <div className="space-y-3">
                {todayPlans.map((plan) => (
                  <div
                    key={plan.id}
                    className="p-3 bg-slate-50 rounded-lg"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-slate-800">
                        {plan.subjectName}
                      </span>
                      <span className="text-sm text-blue-600">
                        {plan.startTime}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500">
                      {plan.studentName}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-400">
                <Calendar className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p className="text-sm">今日暂无课程</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-800 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              学员列表
            </h3>
            <Link
              to="/coach/students"
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              查看全部 →
            </Link>
          </div>

          <div className="space-y-3">
            {students.slice(0, 5).map((student) => {
              const progress = Math.round(
                (student.completedHours / student.totalHours) * 100
              );
              const studentUser = { name: student.status };

              return (
                <div
                  key={student.id}
                  className="flex items-center gap-4 p-3 hover:bg-slate-50 rounded-lg transition-colors"
                >
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-medium">
                    {student.status?.charAt(0) || '学'}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-slate-800">
                        {student.status === 'studying' ? '学员' : student.status}
                      </span>
                      <span className="text-sm text-slate-500">
                        {student.completedHours}/{student.totalHours} 学时
                      </span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Layout>
  );
}

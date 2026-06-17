import { useState, useEffect } from 'react';
import Layout from '../../components/Layout/Layout';
import StatCard from '../../components/Card/StatCard';
import {
  Users,
  GraduationCap,
  FileText,
  Wallet,
  TrendingUp,
  TrendingDown,
  Newspaper,
  BarChart3,
} from 'lucide-react';
import api from '../../utils/api';
import { Link } from 'react-router-dom';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';

const studentTrendData = [
  { date: '周一', newStudents: 5, total: 120 },
  { date: '周二', newStudents: 8, total: 128 },
  { date: '周三', newStudents: 3, total: 131 },
  { date: '周四', newStudents: 6, total: 137 },
  { date: '周五', newStudents: 10, total: 147 },
  { date: '周六', newStudents: 12, total: 159 },
  { date: '周日', newStudents: 4, total: 163 },
];

const examTrendData = [
  { date: '周一', count: 8, pass: 7 },
  { date: '周二', count: 12, pass: 10 },
  { date: '周三', count: 6, pass: 5 },
  { date: '周四', count: 10, pass: 8 },
  { date: '周五', count: 15, pass: 13 },
  { date: '周六', count: 20, pass: 17 },
  { date: '周日', count: 5, pass: 4 },
];

const revenueTrendData = [
  { date: '周一', revenue: 25000, refund: 2000 },
  { date: '周二', revenue: 32000, refund: 1500 },
  { date: '周三', revenue: 18000, refund: 3000 },
  { date: '周四', revenue: 28000, refund: 1000 },
  { date: '周五', revenue: 45000, refund: 2500 },
  { date: '周六', revenue: 52000, refund: 1800 },
  { date: '周日', revenue: 15000, refund: 500 },
];

export default function PrincipalDashboard() {
  const [overview, setOverview] = useState<any>(null);
  const [dailyReports, setDailyReports] = useState<any[]>([]);

  useEffect(() => {
    fetchOverview();
    fetchDailyReports();
  }, []);

  const fetchOverview = async () => {
    try {
      const response = await api.get<any>('/reports/overview');
      if (response.success) {
        setOverview(response.overview);
      }
    } catch (error) {
      console.error('Fetch overview error:', error);
    }
  };

  const fetchDailyReports = async () => {
    try {
      const response = await api.get<any>('/reports/daily?days=3');
      if (response.success) {
        setDailyReports(response.reports || []);
      }
    } catch (error) {
      console.error('Fetch daily reports error:', error);
    }
  };

  return (
    <Layout role="principal" title="校长首页">
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">运营数据总览</h2>
              <p className="text-indigo-100 mt-1">
                实时掌握驾校运营情况 📊
              </p>
            </div>
            <Link
              to="/principal/reports"
              className="px-6 py-3 bg-white text-indigo-600 font-semibold rounded-xl hover:bg-indigo-50 transition-colors flex items-center gap-2"
            >
              <BarChart3 className="w-5 h-5" />
              查看详细报表
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-6 gap-4">
          <StatCard
            title="总学员数"
            value={overview?.totalStudents || 163}
            icon={Users}
            color="blue"
            trend="8人 较上周"
            trendUp
          />
          <StatCard
            title="在培学员"
            value={overview?.studyingStudents || 145}
            icon={GraduationCap}
            color="green"
            trend="5人 较上周"
            trendUp
          />
          <StatCard
            title="总教练数"
            value={overview?.totalCoaches || 12}
            icon={Users}
            color="purple"
          />
          <StatCard
            title="本月考试人次"
            value={overview?.totalExamAppointments || 156}
            icon={FileText}
            color="amber"
            trend="12% 较上月"
            trendUp
          />
          <StatCard
            title="本月营收"
            value={`¥${((overview?.totalRevenue || 215000) / 10000).toFixed(1)}万`}
            icon={Wallet}
            color="green"
            trend="8.5% 较上月"
            trendUp
          />
          <StatCard
            title="平均通过率"
            value={`${overview?.avgPassRate || 89.2}%`}
            icon={TrendingUp}
            color="blue"
            trend="1.2% 较上月"
            trendUp
          />
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 bg-white rounded-xl border border-slate-100 p-5">
            <h3 className="font-semibold text-slate-800 mb-6 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              学员增长趋势
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={studentTrendData}>
                  <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} />
                  <YAxis stroke="#94a3b8" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="total"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    fill="url(#colorTotal)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                <Newspaper className="w-5 h-5 text-indigo-600" />
                最新日报
              </h3>
              <Link
                to="/principal/daily"
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                更多 →
              </Link>
            </div>

            <div className="space-y-3">
              {dailyReports.slice(0, 3).map((report, idx) => (
                <div
                  key={report.id || idx}
                  className="p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-slate-800">
                      {report.reportDate}
                    </span>
                    {idx === 0 && (
                      <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-600 rounded">
                        最新
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <p className="text-slate-500">培训学时</p>
                      <p className="font-medium text-slate-700">
                        {report.totalTrainingHours}h
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-500">考试预约</p>
                      <p className="font-medium text-slate-700">
                        {report.examAppointmentCount}人
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-500">新增学员</p>
                      <p className="font-medium text-slate-700">
                        {report.newStudents}人
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-slate-100 p-5">
            <h3 className="font-semibold text-slate-800 mb-6 flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-600" />
              本周考试情况
            </h3>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={examTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} />
                  <YAxis stroke="#94a3b8" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="count" name="考试人数" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="pass" name="通过人数" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-100 p-5">
            <h3 className="font-semibold text-slate-800 mb-6 flex items-center gap-2">
              <Wallet className="w-5 h-5 text-amber-600" />
              本周营收趋势
            </h3>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} />
                  <YAxis stroke="#94a3b8" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                    }}
                    formatter={(value) => [`¥${value.toLocaleString()}`, '']}
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    name="营收"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    dot={{ fill: '#f59e0b' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="refund"
                    name="退费"
                    stroke="#ef4444"
                    strokeWidth={2}
                    dot={{ fill: '#ef4444' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

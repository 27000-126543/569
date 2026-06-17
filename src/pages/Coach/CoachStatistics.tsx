import { useState } from 'react';
import Layout from '../../components/Layout/Layout';
import {
  BarChart3,
  TrendingUp,
  Users,
  Clock,
  CheckCircle,
} from 'lucide-react';
import { useAuthStore } from '../../store/useStore';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

const hourlyData = [
  { month: '1月', hours: 120 },
  { month: '2月', hours: 135 },
  { month: '3月', hours: 142 },
  { month: '4月', hours: 128 },
  { month: '5月', hours: 156 },
  { month: '6月', hours: 168 },
];

const passRateData = [
  { subject: '科目一', rate: 95 },
  { subject: '科目二', rate: 85 },
  { subject: '科目三', rate: 88 },
  { subject: '科目四', rate: 92 },
];

const subjectDistribution = [
  { name: '科目二', value: 35, color: '#3b82f6' },
  { name: '科目三', value: 30, color: '#10b981' },
  { name: '科目一', value: 20, color: '#f59e0b' },
  { name: '科目四', value: 15, color: '#8b5cf6' },
];

export default function CoachStatistics() {
  const { coach } = useAuthStore();
  const [period, setPeriod] = useState<'month' | 'quarter' | 'year'>('month');

  return (
    <Layout role="coach" title="统计报表">
      <div className="space-y-6">
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-slate-100 p-5">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-xl">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">本月课时</p>
                <p className="text-2xl font-bold text-slate-800">168h</p>
              </div>
            </div>
            <p className="text-xs text-emerald-600 mt-3">↑ 12% 较上月</p>
          </div>

          <div className="bg-white rounded-xl border border-slate-100 p-5">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-100 rounded-xl">
                <Users className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">带教学员</p>
                <p className="text-2xl font-bold text-slate-800">25人</p>
              </div>
            </div>
            <p className="text-xs text-emerald-600 mt-3">↑ 3人 较上月</p>
          </div>

          <div className="bg-white rounded-xl border border-slate-100 p-5">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-amber-100 rounded-xl">
                <CheckCircle className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">考试通过率</p>
                <p className="text-2xl font-bold text-slate-800">92.5%</p>
              </div>
            </div>
            <p className="text-xs text-emerald-600 mt-3">↑ 2.3% 较上月</p>
          </div>

          <div className="bg-white rounded-xl border border-slate-100 p-5">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 rounded-xl">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">累计课时</p>
                <p className="text-2xl font-bold text-slate-800">1,250h</p>
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-3">入职以来总计</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-slate-100 p-5">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                课时趋势
              </h3>
              <div className="flex gap-1">
                {(['month', 'quarter', 'year'] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPeriod(p)}
                    className={`px-3 py-1 text-xs rounded-md transition-colors ${
                      period === p
                        ? 'bg-blue-100 text-blue-600'
                        : 'text-slate-500 hover:bg-slate-100'
                    }`}
                  >
                    {p === 'month' ? '月' : p === 'quarter' ? '季度' : '年'}
                  </button>
                ))}
              </div>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={hourlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
                  <YAxis stroke="#94a3b8" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="hours"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={{ fill: '#3b82f6' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-100 p-5">
            <h3 className="font-semibold text-slate-800 flex items-center gap-2 mb-6">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
              各科目通过率
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={passRateData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="subject" stroke="#94a3b8" fontSize={12} />
                  <YAxis stroke="#94a3b8" fontSize={12} domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                    }}
                    formatter={(value) => [`${value}%`, '通过率']}
                  />
                  <Bar dataKey="rate" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div className="bg-white rounded-xl border border-slate-100 p-5">
            <h3 className="font-semibold text-slate-800 mb-4">课时分布</h3>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={subjectDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {subjectDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {subjectDistribution.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm text-slate-600">{item.name}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="col-span-2 bg-white rounded-xl border border-slate-100 p-5">
            <h3 className="font-semibold text-slate-800 mb-4">
              最近考试记录
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">
                      学员
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">
                      科目
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">
                      成绩
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">
                      结果
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">
                      日期
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { name: '张明', subject: '科目一', score: 96, result: 'passed', date: '2024-02-15' },
                    { name: '李华', subject: '科目一', score: 92, result: 'passed', date: '2024-03-01' },
                    { name: '王磊', subject: '科目二', score: 85, result: 'passed', date: '2024-03-10' },
                    { name: '赵静', subject: '科目三', score: 0, result: 'failed', date: '2024-03-12' },
                    { name: '孙伟', subject: '科目二', score: 90, result: 'passed', date: '2024-03-15' },
                  ].map((item, idx) => (
                    <tr key={idx} className="border-b border-slate-50">
                      <td className="py-3 px-4 text-sm text-slate-800">{item.name}</td>
                      <td className="py-3 px-4 text-sm text-slate-800">{item.subject}</td>
                      <td className="py-3 px-4 text-sm font-medium text-slate-800">
                        {item.score > 0 ? `${item.score}分` : '-'}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            item.result === 'passed'
                              ? 'bg-emerald-100 text-emerald-600'
                              : 'bg-rose-100 text-rose-600'
                          }`}
                        >
                          {item.result === 'passed' ? '通过' : '未通过'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-slate-500">{item.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

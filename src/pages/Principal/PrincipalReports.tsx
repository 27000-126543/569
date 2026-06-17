import { useState, useEffect } from 'react';
import Layout from '../../components/Layout/Layout';
import {
  BarChart3,
  Users,
  TrendingUp,
  TrendingDown,
  Award,
  Download,
  Filter,
} from 'lucide-react';
import api from '../../utils/api';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';
import type { CoachStats } from '../../../shared/types';

export default function PrincipalReports() {
  const [coachStats, setCoachStats] = useState<CoachStats[]>([]);
  const [activeTab, setActiveTab] = useState<'coach' | 'exam' | 'finance'>('coach');

  useEffect(() => {
    fetchCoachStats();
  }, []);

  const fetchCoachStats = async () => {
    try {
      const response = await api.get<any>('/reports/coach-comparison');
      if (response.success) {
        setCoachStats(response.stats || []);
      }
    } catch (error) {
      console.error('Fetch coach stats error:', error);
    }
  };

  const radarData = coachStats.map((coach) => ({
    coach: coach.coachName,
    通过率: coach.passRate,
    学员数: (coach.totalStudents / 30) * 100,
    退费率: (1 - coach.refundRate / 100) * 100,
    课时量: (coach.totalHours / 1500) * 100,
    满意度: coach.avgRating * 20,
  }));

  const examTrendData = [
    { month: '1月', 科目一: 95, 科目二: 82, 科目三: 85, 科目四: 93 },
    { month: '2月', 科目一: 92, 科目二: 78, 科目三: 88, 科目四: 90 },
    { month: '3月', 科目一: 94, 科目二: 85, 科目三: 86, 科目四: 92 },
    { month: '4月', 科目一: 91, 科目二: 80, 科目三: 83, 科目四: 89 },
    { month: '5月', 科目一: 96, 科目二: 88, 科目三: 90, 科目四: 95 },
    { month: '6月', 科目一: 93, 科目二: 86, 科目三: 87, 科目四: 91 },
  ];

  const financeTrendData = [
    { month: '1月', 营收: 185000, 退费: 12000 },
    { month: '2月', 营收: 210000, 退费: 15000 },
    { month: '3月', 营收: 245000, 退费: 8000 },
    { month: '4月', 营收: 198000, 退费: 18000 },
    { month: '5月', 营收: 268000, 退费: 10000 },
    { month: '6月', 营收: 215000, 退费: 13000 },
  ];

  return (
    <Layout role="principal" title="数据报表">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            {(['coach', 'exam', 'finance'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-2.5 rounded-lg font-medium transition-colors ${
                  activeTab === tab
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                }`}
              >
                {tab === 'coach' ? '教练对比' : tab === 'exam' ? '考试分析' : '财务分析'}
              </button>
            ))}
          </div>
          <button className="px-4 py-2 bg-white text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 flex items-center gap-2">
            <Filter className="w-4 h-4" />
            筛选
          </button>
        </div>

        {activeTab === 'coach' && (
          <>
            <div className="grid grid-cols-4 gap-4">
              {coachStats.map((coach) => (
                <div
                  key={coach.coachId}
                  className="bg-white rounded-xl border border-slate-100 p-5 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-lg">
                      {coach.coachName.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-800">{coach.coachName}</h4>
                      <p className="text-sm text-slate-500">教龄 {coach.coachId ? 8 : 5} 年</p>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-500">学员数</span>
                      <span className="font-medium text-slate-800">{coach.totalStudents}人</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">通过率</span>
                      <span className="font-medium text-emerald-600">{coach.passRate}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">退费率</span>
                      <span className="font-medium text-rose-600">{coach.refundRate}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">累计课时</span>
                      <span className="font-medium text-slate-800">{coach.totalHours}h</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="bg-white rounded-xl border border-slate-100 p-5">
                <h3 className="font-semibold text-slate-800 mb-6 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                  教练通过率对比
                </h3>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={coachStats} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis type="number" domain={[0, 100]} stroke="#94a3b8" fontSize={12} />
                      <YAxis dataKey="coachName" type="category" stroke="#94a3b8" fontSize={12} width={70} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#fff',
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                        }}
                        formatter={(value) => [`${value}%`, '通过率']}
                      />
                      <Bar dataKey="passRate" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-100 p-5">
                <h3 className="font-semibold text-slate-800 mb-6 flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-600" />
                  综合能力雷达图
                </h3>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="#e2e8f0" />
                      <PolarAngleAxis dataKey="coach" stroke="#64748b" fontSize={11} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#94a3b8" fontSize={10} />
                      <Radar name="通过率" dataKey="通过率" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                      <Radar name="学员数" dataKey="学员数" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                      <Legend />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-100 p-5">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-slate-800">教练排行榜</h3>
                <button className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1">
                  <Download className="w-4 h-4" />
                  导出报表
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">排名</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">教练</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">学员数</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">通过率</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">退费率</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">累计课时</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">综合评分</th>
                    </tr>
                  </thead>
                  <tbody>
                    {coachStats
                      .sort((a, b) => b.passRate - a.passRate)
                      .map((coach, index) => (
                        <tr key={coach.coachId} className="border-b border-slate-50 hover:bg-slate-50">
                          <td className="py-4 px-4">
                            <span
                              className={`w-6 h-6 inline-flex items-center justify-center rounded-full text-xs font-bold ${
                                index === 0
                                  ? 'bg-amber-100 text-amber-600'
                                  : index === 1
                                  ? 'bg-slate-200 text-slate-600'
                                  : index === 2
                                  ? 'bg-orange-100 text-orange-600'
                                  : 'bg-slate-100 text-slate-500'
                              }`}
                            >
                              {index + 1}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-sm font-medium">
                                {coach.coachName.charAt(0)}
                              </div>
                              <span className="font-medium text-slate-800">{coach.coachName}</span>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-sm text-slate-800">{coach.totalStudents}人</td>
                          <td className="py-4 px-4">
                            <span className="text-emerald-600 font-medium">{coach.passRate}%</span>
                          </td>
                          <td className="py-4 px-4">
                            <span className="text-rose-600 font-medium">{coach.refundRate}%</span>
                          </td>
                          <td className="py-4 px-4 text-sm text-slate-800">{coach.totalHours}h</td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-1">
                              <span className="text-amber-500">★</span>
                              <span className="font-medium text-slate-800">{coach.avgRating}</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {activeTab === 'exam' && (
          <div className="space-y-6">
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-white rounded-xl border border-slate-100 p-5">
                <p className="text-sm text-slate-500 mb-1">本月考试人次</p>
                <p className="text-2xl font-bold text-slate-800">156</p>
                <p className="text-xs text-emerald-600 mt-2">↑ 12.5% 较上月</p>
              </div>
              <div className="bg-white rounded-xl border border-slate-100 p-5">
                <p className="text-sm text-slate-500 mb-1">整体通过率</p>
                <p className="text-2xl font-bold text-emerald-600">89.2%</p>
                <p className="text-xs text-emerald-600 mt-2">↑ 1.2% 较上月</p>
              </div>
              <div className="bg-white rounded-xl border border-slate-100 p-5">
                <p className="text-sm text-slate-500 mb-1">科目一通过率</p>
                <p className="text-2xl font-bold text-blue-600">93.5%</p>
                <p className="text-xs text-slate-400 mt-2">最高通过率</p>
              </div>
              <div className="bg-white rounded-xl border border-slate-100 p-5">
                <p className="text-sm text-slate-500 mb-1">科目二通过率</p>
                <p className="text-2xl font-bold text-amber-600">82.1%</p>
                <p className="text-xs text-slate-400 mt-2">最低通过率</p>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-100 p-5">
              <h3 className="font-semibold text-slate-800 mb-6">各科目通过率趋势</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={examTrendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
                    <YAxis stroke="#94a3b8" fontSize={12} domain={[0, 100]} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                      }}
                      formatter={(value) => [`${value}%`, '']}
                    />
                    <Legend />
                    <Bar dataKey="科目一" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="科目二" fill="#10b981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="科目三" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="科目四" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'finance' && (
          <div className="space-y-6">
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-white rounded-xl border border-slate-100 p-5">
                <p className="text-sm text-slate-500 mb-1">本月营收</p>
                <p className="text-2xl font-bold text-emerald-600">¥21.5万</p>
                <p className="text-xs text-emerald-600 mt-2">↑ 8.5% 较上月</p>
              </div>
              <div className="bg-white rounded-xl border border-slate-100 p-5">
                <p className="text-sm text-slate-500 mb-1">本月退费</p>
                <p className="text-2xl font-bold text-rose-600">¥1.3万</p>
                <p className="text-xs text-rose-600 mt-2">↑ 5.2% 较上月</p>
              </div>
              <div className="bg-white rounded-xl border border-slate-100 p-5">
                <p className="text-sm text-slate-500 mb-1">净营收</p>
                <p className="text-2xl font-bold text-blue-600">¥20.2万</p>
                <p className="text-xs text-emerald-600 mt-2">↑ 7.8% 较上月</p>
              </div>
              <div className="bg-white rounded-xl border border-slate-100 p-5">
                <p className="text-sm text-slate-500 mb-1">退费率</p>
                <p className="text-2xl font-bold text-amber-600">6.0%</p>
                <p className="text-xs text-slate-400 mt-2">营收占比</p>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-100 p-5">
              <h3 className="font-semibold text-slate-800 mb-6">营收与退费趋势</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={financeTrendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
                    <YAxis
                      stroke="#94a3b8"
                      fontSize={12}
                      tickFormatter={(value) => `¥${value / 10000}万`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                      }}
                      formatter={(value) => [`¥${value.toLocaleString()}`, '']}
                    />
                    <Legend />
                    <Bar dataKey="营收" fill="#10b981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="退费" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

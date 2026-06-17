import { useState, useEffect } from 'react';
import Layout from '../../components/Layout/Layout';
import { Users, Search, Clock, TrendingUp } from 'lucide-react';
import { useAuthStore } from '../../store/useStore';
import api from '../../utils/api';
import type { Student } from '../../../shared/types';

export default function CoachStudents() {
  const { coach } = useAuthStore();
  const [students, setStudents] = useState<Student[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'studying' | 'graduated'>(
    'all'
  );

  useEffect(() => {
    if (coach) {
      fetchStudents();
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

  const filteredStudents = students.filter((s) => {
    if (filter !== 'all' && s.status !== filter) return false;
    if (searchQuery) {
      return s.id.includes(searchQuery);
    }
    return true;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'studying':
        return 'bg-blue-100 text-blue-600';
      case 'graduated':
        return 'bg-emerald-100 text-emerald-600';
      case 'refunded':
        return 'bg-slate-100 text-slate-600';
      default:
        return 'bg-slate-100 text-slate-600';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'studying':
        return '学习中';
      case 'graduated':
        return '已毕业';
      case 'refunded':
        return '已退学';
      default:
        return status;
    }
  };

  return (
    <Layout role="coach" title="学员管理">
      <div className="space-y-6">
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-slate-100 p-5">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-xl">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">
                  {students.length}
                </p>
                <p className="text-sm text-slate-500">总学员数</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-slate-100 p-5">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-100 rounded-xl">
                <TrendingUp className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">
                  {students.filter((s) => s.status === 'studying').length}
                </p>
                <p className="text-sm text-slate-500">在培学员</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-slate-100 p-5">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-amber-100 rounded-xl">
                <Clock className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">
                  {students.filter((s) => s.status === 'graduated').length}
                </p>
                <p className="text-sm text-slate-500">已毕业</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-100 p-5">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-slate-800">学员列表</h3>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="搜索学员..."
                  className="pl-10 pr-4 py-2 w-56 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex gap-1">
                {(['all', 'studying', 'graduated'] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                      filter === f
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {f === 'all' ? '全部' : f === 'studying' ? '在培' : '已毕业'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">
                    学员
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">
                    驾照类型
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">
                    培训进度
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">
                    报名日期
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">
                    状态
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student) => {
                  const progress = Math.round(
                    (student.completedHours / student.totalHours) * 100
                  );

                  return (
                    <tr
                      key={student.id}
                      className="border-b border-slate-50 hover:bg-slate-50"
                    >
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-medium">
                            学
                          </div>
                          <div>
                            <p className="font-medium text-slate-800">学员{student.id.slice(-2)}</p>
                            <p className="text-sm text-slate-500">
                              ID: {student.id}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-sm text-slate-800">
                        {student.licenseType}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-500 rounded-full"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                          <span className="text-sm text-slate-600">
                            {student.completedHours}/{student.totalHours}h
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-sm text-slate-600">
                        {student.registerDate}
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`px-3 py-1 text-xs rounded-full ${getStatusColor(
                            student.status
                          )}`}
                        >
                          {getStatusText(student.status)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredStudents.length === 0 && (
            <div className="text-center py-12 text-slate-400">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>暂无学员</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

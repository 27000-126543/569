import { useEffect, useState } from 'react';
import Layout from '../../components/Layout/Layout';
import { Clock, CheckCircle, Circle, BookOpen } from 'lucide-react';
import { useAuthStore } from '../../store/useStore';
import api from '../../utils/api';
import type { TrainingRecord } from '../../../shared/types';

export default function StudentHours() {
  const { student, user } = useAuthStore();
  const [records, setRecords] = useState<TrainingRecord[]>([]);

  useEffect(() => {
    if (student) {
      fetchRecords();
    }
  }, [student]);

  const fetchRecords = async () => {
    try {
      const response = await api.get<any>(`/training/hours/${student?.id}`);
      if (response.success) {
        setRecords(response.records || []);
      }
    } catch (error) {
      console.error('Fetch training hours error:', error);
    }
  };

  const totalProgress = student
    ? Math.round((student.completedHours / student.totalHours) * 100)
    : 0;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'passed':
        return 'text-emerald-600 bg-emerald-50';
      case 'completed':
        return 'text-blue-600 bg-blue-50';
      case 'studying':
        return 'text-amber-600 bg-amber-50';
      default:
        return 'text-slate-400 bg-slate-50';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'passed':
        return '已通过';
      case 'completed':
        return '学时已满';
      case 'studying':
        return '学习中';
      default:
        return '未开始';
    }
  };

  return (
    <Layout role="student" title="学时查询">
      <div className="space-y-6">
        <div className="bg-white rounded-xl border border-slate-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              总体进度
            </h3>
            <span className="text-2xl font-bold text-blue-600">
              {student?.completedHours}/{student?.totalHours} 学时
            </span>
          </div>

          <div className="h-4 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500"
              style={{ width: `${totalProgress}%` }}
            />
          </div>

          <p className="text-sm text-slate-500 mt-2">
            已完成 <strong className="text-slate-800">{totalProgress}%</strong> 的培训
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-100 p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-6 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-600" />
            各科学时详情
          </h3>

          <div className="space-y-5">
            {student?.subjects.map((subject, index) => {
              const progress = Math.round(
                (subject.completedHours / subject.requiredHours) * 100
              );

              return (
                <div key={subject.subject} className="relative">
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                        subject.status === 'passed' || subject.status === 'completed'
                          ? 'bg-emerald-500 text-white'
                          : subject.status === 'studying'
                          ? 'bg-blue-500 text-white'
                          : 'bg-slate-200 text-slate-400'
                      }`}
                    >
                      {subject.status === 'passed' || subject.status === 'completed' ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : (
                        <span className="font-medium">{index + 1}</span>
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-slate-800">
                            {subject.subjectName}
                          </h4>
                          <span
                            className={`px-2 py-0.5 text-xs rounded-full ${getStatusColor(
                              subject.status
                            )}`}
                          >
                            {getStatusText(subject.status)}
                          </span>
                        </div>
                        <span className="text-sm text-slate-600">
                          {subject.completedHours}/{subject.requiredHours} 学时
                        </span>
                      </div>

                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            subject.status === 'passed'
                              ? 'bg-emerald-500'
                              : subject.status === 'completed'
                              ? 'bg-blue-500'
                              : 'bg-amber-500'
                          }`}
                          style={{ width: `${Math.min(progress, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-100 p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-6 flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600" />
            培训记录
          </h3>

          {records.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">
                      日期
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">
                      科目
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">
                      签到时间
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">
                      签退时间
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">
                      学时
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">
                      状态
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((record) => (
                    <tr
                      key={record.id}
                      className="border-b border-slate-50 hover:bg-slate-50"
                    >
                      <td className="py-3 px-4 text-sm text-slate-800">
                        {record.trainingDate}
                      </td>
                      <td className="py-3 px-4 text-sm text-slate-800">
                        {record.subjectName}
                      </td>
                      <td className="py-3 px-4 text-sm text-slate-600">
                        {record.signInTime}
                      </td>
                      <td className="py-3 px-4 text-sm text-slate-600">
                        {record.signOutTime || '-'}
                      </td>
                      <td className="py-3 px-4 text-sm font-medium text-blue-600">
                        {record.hours}h
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            record.status === 'completed'
                              ? 'bg-emerald-50 text-emerald-600'
                              : 'bg-amber-50 text-amber-600'
                          }`}
                        >
                          {record.status === 'completed' ? '已完成' : '进行中'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400">
              <Circle className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>暂无培训记录</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

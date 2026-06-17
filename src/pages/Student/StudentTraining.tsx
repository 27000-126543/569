import { useState, useEffect } from 'react';
import Layout from '../../components/Layout/Layout';
import { CalendarClock, Clock, MapPin, User, CheckCircle, Circle } from 'lucide-react';
import { useAuthStore } from '../../store/useStore';
import api from '../../utils/api';
import type { TrainingPlan } from '../../../shared/types';

export default function StudentTraining() {
  const { student } = useAuthStore();
  const [plans, setPlans] = useState<TrainingPlan[]>([]);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'completed'>('all');

  useEffect(() => {
    if (student) {
      fetchPlans();
    }
  }, [student]);

  const fetchPlans = async () => {
    try {
      const response = await api.get<any>(
        `/students/${student?.id}/training-plans`
      );
      if (response.success) {
        setPlans(response.plans || []);
      }
    } catch (error) {
      console.error('Fetch training plans error:', error);
    }
  };

  const filteredPlans = plans.filter((plan) => {
    if (filter === 'all') return true;
    if (filter === 'upcoming') return plan.status === 'scheduled';
    if (filter === 'completed') return plan.status === 'completed';
    return true;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-600';
      case 'completed':
        return 'bg-emerald-100 text-emerald-600';
      case 'cancelled':
        return 'bg-slate-100 text-slate-600';
      default:
        return 'bg-slate-100 text-slate-600';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'scheduled':
        return '待上课';
      case 'completed':
        return '已完成';
      case 'cancelled':
        return '已取消';
      default:
        return status;
    }
  };

  return (
    <Layout role="student" title="培训计划">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-800">
            我的培训计划
          </h2>
          <div className="flex gap-2">
            {(['all', 'upcoming', 'completed'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === f
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                }`}
              >
                {f === 'all' ? '全部' : f === 'upcoming' ? '待上课' : '已完成'}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-slate-100 p-5">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-xl">
                <CalendarClock className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">{plans.length}</p>
                <p className="text-sm text-slate-500">总计划数</p>
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
                  {plans.filter((p) => p.status === 'scheduled').length}
                </p>
                <p className="text-sm text-slate-500">待上课</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-100 p-5">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-100 rounded-xl">
                <CheckCircle className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">
                  {plans.filter((p) => p.status === 'completed').length}
                </p>
                <p className="text-sm text-slate-500">已完成</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-100 p-6">
          {filteredPlans.length > 0 ? (
            <div className="space-y-4">
              {filteredPlans.map((plan) => (
                <div
                  key={plan.id}
                  className="flex items-center justify-between p-5 border border-slate-100 rounded-xl hover:border-blue-200 hover:shadow-sm transition-all"
                >
                  <div className="flex items-center gap-5">
                    <div
                      className={`w-16 h-16 rounded-xl flex flex-col items-center justify-center ${
                        plan.status === 'scheduled'
                          ? 'bg-blue-50'
                          : plan.status === 'completed'
                          ? 'bg-emerald-50'
                          : 'bg-slate-50'
                      }`}
                    >
                      <p
                        className={`text-lg font-bold ${
                          plan.status === 'scheduled'
                            ? 'text-blue-600'
                            : plan.status === 'completed'
                            ? 'text-emerald-600'
                            : 'text-slate-600'
                        }`}
                      >
                        {plan.startTime}
                      </p>
                      <p className="text-xs text-slate-500">{plan.subjectName}</p>
                    </div>

                    <div>
                      <h4 className="font-medium text-slate-800 text-lg">
                        {plan.subjectName} 培训
                      </h4>
                      <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
                        <span className="flex items-center gap-1">
                          <CalendarClock className="w-4 h-4" />
                          {plan.planDate}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {plan.startTime} - {plan.endTime}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 mt-2 text-sm text-slate-500">
                        <User className="w-4 h-4" />
                        <span>教练：{plan.studentName ? '陈教练' : '陈教练'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span
                      className={`px-3 py-1 text-sm rounded-full ${getStatusColor(
                        plan.status
                      )}`}
                    >
                      {getStatusText(plan.status)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-slate-400">
              <Circle className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p className="text-lg">暂无培训计划</p>
              <p className="text-sm mt-2">请先完成报名，系统将为您安排培训计划</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

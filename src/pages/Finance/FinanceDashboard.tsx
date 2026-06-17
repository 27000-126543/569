import { useState, useEffect } from 'react';
import Layout from '../../components/Layout/Layout';
import StatCard from '../../components/Card/StatCard';
import {
  Wallet,
  Clock,
  CheckCircle,
  TrendingUp,
  FileCheck,
  AlertCircle,
  Check,
  X,
  Eye,
} from 'lucide-react';
import api from '../../utils/api';
import { Link } from 'react-router-dom';
import type { RefundRequest } from '../../../shared/types';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const revenueData = [
  { day: '周一', revenue: 25000 },
  { day: '周二', revenue: 32000 },
  { day: '周三', revenue: 18000 },
  { day: '周四', revenue: 28000 },
  { day: '周五', revenue: 45000 },
  { day: '周六', revenue: 52000 },
  { day: '周日', revenue: 15000 },
];

export default function FinanceDashboard() {
  const [pendingRefunds, setPendingRefunds] = useState<RefundRequest[]>([]);
  const [allRefunds, setAllRefunds] = useState<RefundRequest[]>([]);

  useEffect(() => {
    fetchRefunds();
  }, []);

  const fetchRefunds = async () => {
    try {
      const response = await api.get<any>('/refunds');
      if (response.success) {
        setAllRefunds(response.requests || []);
        setPendingRefunds(
          (response.requests || []).filter((r: RefundRequest) => r.status === 'pending')
        );
      }
    } catch (error) {
      console.error('Fetch refunds error:', error);
    }
  };

  const totalRefundAmount = allRefunds
    .filter((r) => r.status === 'approved')
    .reduce((sum, r) => sum + r.refundAmount, 0);

  const pendingAmount = pendingRefunds.reduce((sum, r) => sum + r.refundAmount, 0);

  return (
    <Layout role="finance" title="财务首页">
      <div className="space-y-6">
        <div className="grid grid-cols-4 gap-4">
          <StatCard
            title="待审批退费"
            value={pendingRefunds.length}
            icon={Clock}
            color="amber"
            trend={`¥${(pendingAmount / 10000).toFixed(1)}万`}
          />
          <StatCard
            title="本月退费金额"
            value={`¥${(totalRefundAmount / 10000).toFixed(1)}万`}
            icon={Wallet}
            color="red"
            trend="12% 较上月"
            trendUp={false}
          />
          <StatCard
            title="已审批通过"
            value={allRefunds.filter(r => r.status === 'approved').length}
            icon={CheckCircle}
            color="green"
          />
          <StatCard
            title="本月营收"
            value="¥21.5万"
            icon={TrendingUp}
            color="blue"
            trend="8.5% 较上月"
            trendUp
          />
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 bg-white rounded-xl border border-slate-100 p-5">
            <h3 className="font-semibold text-slate-800 mb-6 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              本周营收趋势
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} />
                  <YAxis
                    stroke="#94a3b8"
                    fontSize={12}
                    tickFormatter={(value) => `¥${value / 1000}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                    }}
                    formatter={(value) => [`¥${value.toLocaleString()}`, '营收']}
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={{ fill: '#3b82f6' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-amber-500" />
                待审批退费
              </h3>
              <Link
                to="/finance/refunds"
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                全部 →
              </Link>
            </div>

            {pendingRefunds.length > 0 ? (
              <div className="space-y-3">
                {pendingRefunds.slice(0, 3).map((request) => (
                  <div
                    key={request.id}
                    className="p-3 bg-amber-50 rounded-lg"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-slate-800">
                        {request.studentName}
                      </span>
                      <span className="text-lg font-bold text-amber-600">
                        ¥{request.refundAmount.toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500 truncate">
                      {request.reason}
                    </p>
                    <div className="flex gap-2 mt-3">
                      <button
                        className="flex-1 py-1.5 bg-emerald-600 text-white text-sm rounded hover:bg-emerald-700 flex items-center justify-center gap-1"
                      >
                        <Check className="w-4 h-4" />
                        通过
                      </button>
                      <button
                        className="flex-1 py-1.5 bg-rose-100 text-rose-600 text-sm rounded hover:bg-rose-200 flex items-center justify-center gap-1"
                      >
                        <X className="w-4 h-4" />
                        拒绝
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-400">
                <CheckCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">暂无待审批退费</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-100 p-5">
          <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-500" />
            快速操作
          </h3>

          <div className="grid grid-cols-4 gap-4">
            <Link
              to="/finance/refunds"
              className="p-4 border border-slate-100 rounded-xl hover:border-blue-200 hover:bg-blue-50/50 transition-all"
            >
              <div className="p-3 bg-amber-100 w-fit rounded-lg mb-3">
                <FileCheck className="w-6 h-6 text-amber-600" />
              </div>
              <h4 className="font-medium text-slate-800">退费审批</h4>
              <p className="text-sm text-slate-500 mt-1">审核学员退费申请</p>
            </Link>

            <div className="p-4 border border-slate-100 rounded-xl hover:border-blue-200 hover:bg-blue-50/50 transition-all cursor-pointer">
              <div className="p-3 bg-emerald-100 w-fit rounded-lg mb-3">
                <Wallet className="w-6 h-6 text-emerald-600" />
              </div>
              <h4 className="font-medium text-slate-800">收入统计</h4>
              <p className="text-sm text-slate-500 mt-1">查看营收明细</p>
            </div>

            <div className="p-4 border border-slate-100 rounded-xl hover:border-blue-200 hover:bg-blue-50/50 transition-all cursor-pointer">
              <div className="p-3 bg-blue-100 w-fit rounded-lg mb-3">
                <Eye className="w-6 h-6 text-blue-600" />
              </div>
              <h4 className="font-medium text-slate-800">支出明细</h4>
              <p className="text-sm text-slate-500 mt-1">查看支出记录</p>
            </div>

            <div className="p-4 border border-slate-100 rounded-xl hover:border-blue-200 hover:bg-blue-50/50 transition-all cursor-pointer">
              <div className="p-3 bg-purple-100 w-fit rounded-lg mb-3">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <h4 className="font-medium text-slate-800">财务报表</h4>
              <p className="text-sm text-slate-500 mt-1">生成财务报表</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

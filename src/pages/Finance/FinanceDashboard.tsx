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
  RefreshCw,
} from 'lucide-react';
import api from '../../utils/api';
import { Link, useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
  const [pendingRefunds, setPendingRefunds] = useState<RefundRequest[]>([]);
  const [allRefunds, setAllRefunds] = useState<RefundRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedRefund, setSelectedRefund] = useState<RefundRequest | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    fetchRefunds();
  }, []);

  const fetchRefunds = async () => {
    setIsLoading(true);
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
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    if (!confirm('确定要通过该退费申请吗？')) return;

    try {
      const response = await api.put<any>(`/refunds/${id}/approve`, {});
      if (response.success) {
        fetchRefunds();
        alert('退费审批已通过！');
      }
    } catch (error) {
      console.error('Approve refund error:', error);
      alert('审批失败，请重试');
    }
  };

  const handleRejectClick = (refund: RefundRequest) => {
    setSelectedRefund(refund);
    setRejectReason('');
    setRejectModalOpen(true);
  };

  const handleRejectConfirm = async () => {
    if (!selectedRefund || !rejectReason.trim()) return;

    try {
      const response = await api.put<any>(`/refunds/${selectedRefund.id}/reject`, {
        rejectReason,
      });
      if (response.success) {
        setRejectModalOpen(false);
        setSelectedRefund(null);
        setRejectReason('');
        fetchRefunds();
        alert('已拒绝退费申请');
      }
    } catch (error) {
      console.error('Reject refund error:', error);
      alert('操作失败，请重试');
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
              <div className="flex items-center gap-2">
                <button
                  onClick={fetchRefunds}
                  className="p-1 text-slate-400 hover:text-slate-600"
                  title="刷新"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                </button>
                <Link
                  to="/finance/refunds"
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  全部 →
                </Link>
              </div>
            </div>

            {pendingRefunds.length > 0 ? (
              <div className="space-y-3 max-h-80 overflow-y-auto">
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
                        onClick={() => handleApprove(request.id)}
                        className="flex-1 py-1.5 bg-emerald-600 text-white text-sm rounded hover:bg-emerald-700 flex items-center justify-center gap-1"
                      >
                        <Check className="w-4 h-4" />
                        通过
                      </button>
                      <button
                        onClick={() => handleRejectClick(request)}
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

      {rejectModalOpen && selectedRefund && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 animate-fade-in">
            <h3 className="text-xl font-bold text-slate-800 mb-2">拒绝退费申请</h3>
            <p className="text-slate-600 mb-4">
              学员 <strong>{selectedRefund.studentName}</strong> 的退费申请
            </p>
            <p className="text-rose-600 font-semibold mb-4">
              退款金额：¥{selectedRefund.refundAmount.toLocaleString()}
            </p>
            <p className="text-sm text-slate-500 mb-3">
              请填写拒绝原因（系统将通知学员）：
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="请输入拒绝原因..."
              rows={4}
              className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent resize-none"
            />
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setRejectModalOpen(false);
                  setSelectedRefund(null);
                  setRejectReason('');
                }}
                className="flex-1 py-3 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50"
              >
                取消
              </button>
              <button
                onClick={handleRejectConfirm}
                disabled={!rejectReason.trim()}
                className="flex-1 py-3 bg-rose-600 text-white rounded-lg hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                确认拒绝
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

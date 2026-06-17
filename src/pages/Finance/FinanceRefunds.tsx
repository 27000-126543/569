import { useState, useEffect } from 'react';
import Layout from '../../components/Layout/Layout';
import {
  FileCheck,
  Search,
  Check,
  X,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  User,
  Calendar,
} from 'lucide-react';
import api from '../../utils/api';
import type { RefundRequest } from '../../../shared/types';

export default function FinanceRefunds() {
  const [refunds, setRefunds] = useState<RefundRequest[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRefund, setSelectedRefund] = useState<RefundRequest | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);

  useEffect(() => {
    fetchRefunds();
  }, [filter]);

  const fetchRefunds = async () => {
    try {
      const url = filter === 'all'
        ? '/refunds'
        : `/refunds?status=${filter}`;
      const response = await api.get<any>(url);
      if (response.success) {
        setRefunds(response.requests || []);
      }
    } catch (error) {
      console.error('Fetch refunds error:', error);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      const response = await api.put<any>(`/refunds/${id}/approve`, {});
      if (response.success) {
        fetchRefunds();
        setSelectedRefund(null);
      }
    } catch (error) {
      console.error('Approve refund error:', error);
    }
  };

  const handleReject = async (id: string) => {
    try {
      const response = await api.put<any>(`/refunds/${id}/reject`, {
        rejectReason,
      });
      if (response.success) {
        fetchRefunds();
        setSelectedRefund(null);
        setShowRejectModal(false);
        setRejectReason('');
      }
    } catch (error) {
      console.error('Reject refund error:', error);
    }
  };

  const filteredRefunds = refunds.filter((r) =>
    r.studentName.includes(searchQuery) || r.id.includes(searchQuery)
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-emerald-100 text-emerald-600';
      case 'rejected':
        return 'bg-rose-100 text-rose-600';
      case 'pending':
        return 'bg-amber-100 text-amber-600';
      default:
        return 'bg-slate-100 text-slate-600';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved':
        return '已通过';
      case 'rejected':
        return '已拒绝';
      case 'pending':
        return '待审批';
      default:
        return status;
    }
  };

  return (
    <Layout role="finance" title="退费审批">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            {(['pending', 'all', 'approved', 'rejected'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === f
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                }`}
              >
                {f === 'pending'
                  ? '待审批'
                  : f === 'all'
                  ? '全部'
                  : f === 'approved'
                  ? '已通过'
                  : '已拒绝'}
              </button>
            ))}
          </div>

          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索学员姓名/申请编号"
              className="pl-10 pr-4 py-2 w-64 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 bg-white rounded-xl border border-slate-100 overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">
                    申请编号
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">
                    学员
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">
                    申请金额
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">
                    申请时间
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">
                    状态
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredRefunds.map((refund) => (
                  <tr
                    key={refund.id}
                    className="border-b border-slate-50 hover:bg-slate-50 cursor-pointer"
                    onClick={() => setSelectedRefund(refund)}
                  >
                    <td className="py-4 px-4">
                      <span className="font-mono text-sm text-blue-600">
                        #{refund.id.slice(-8)}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-sm font-medium">
                          {refund.studentName.charAt(0)}
                        </div>
                        <span className="font-medium text-slate-800">
                          {refund.studentName}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="font-semibold text-rose-600">
                        ¥{refund.refundAmount.toLocaleString()}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-sm text-slate-500">
                      {refund.createdAt}
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${getStatusColor(
                          refund.status
                        )}`}
                      >
                        {getStatusText(refund.status)}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex gap-1">
                        {refund.status === 'pending' && (
                          <>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleApprove(refund.id);
                              }}
                              className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded"
                              title="通过"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedRefund(refund);
                                setShowRejectModal(true);
                              }}
                              className="p-1.5 text-rose-600 hover:bg-rose-50 rounded"
                              title="拒绝"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        <button
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                          title="查看详情"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredRefunds.length === 0 && (
              <div className="text-center py-12 text-slate-400">
                <FileCheck className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>暂无退费申请</p>
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl border border-slate-100 p-5">
            <h3 className="font-semibold text-slate-800 mb-4">申请详情</h3>

            {selectedRefund ? (
              <div className="space-y-4">
                <div className="text-center pb-4 border-b border-slate-100">
                  <p className="text-sm text-slate-500 mb-1">申请退款金额</p>
                  <p className="text-3xl font-bold text-rose-600">
                    ¥{selectedRefund.refundAmount.toLocaleString()}
                  </p>
                  <span
                    className={`inline-block mt-2 px-3 py-1 text-sm rounded-full ${getStatusColor(
                      selectedRefund.status
                    )}`}
                  >
                    {getStatusText(selectedRefund.status)}
                  </span>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-500">学员：</span>
                    <span className="text-slate-800 font-medium">
                      {selectedRefund.studentName}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-500">申请时间：</span>
                    <span className="text-slate-800">
                      {selectedRefund.createdAt}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-500">已培训学时：</span>
                    <span className="text-slate-800">
                      {selectedRefund.completedHours}/{selectedRefund.totalHours} 学时
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100">
                  <p className="text-sm text-slate-500 mb-2">退费原因</p>
                  <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-lg">
                    {selectedRefund.reason}
                  </p>
                </div>

                {selectedRefund.rejectReason && (
                  <div className="pt-3 border-t border-slate-100">
                    <p className="text-sm text-slate-500 mb-2">拒绝原因</p>
                    <p className="text-sm text-rose-700 bg-rose-50 p-3 rounded-lg">
                      {selectedRefund.rejectReason}
                    </p>
                  </div>
                )}

                {selectedRefund.status === 'pending' && (
                  <div className="pt-3 border-t border-slate-100 flex gap-3">
                    <button
                      onClick={() => handleApprove(selectedRefund.id)}
                      className="flex-1 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      通过
                    </button>
                    <button
                      onClick={() => setShowRejectModal(true)}
                      className="flex-1 py-2.5 bg-rose-100 text-rose-600 rounded-lg hover:bg-rose-200 flex items-center justify-center gap-2"
                    >
                      <XCircle className="w-4 h-4" />
                      拒绝
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12 text-slate-400">
                <Eye className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">点击左侧列表查看详情</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {showRejectModal && selectedRefund && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-slate-800 mb-4">拒绝退费申请</h3>
            <p className="text-slate-600 mb-4">
              请填写拒绝原因：
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
                  setShowRejectModal(false);
                  setRejectReason('');
                }}
                className="flex-1 py-3 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50"
              >
                取消
              </button>
              <button
                onClick={() => handleReject(selectedRefund.id)}
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

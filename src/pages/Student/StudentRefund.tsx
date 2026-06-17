import { useState, useEffect } from 'react';
import Layout from '../../components/Layout/Layout';
import {
  Wallet,
  AlertCircle,
  CheckCircle,
  Loader2,
  FileText,
  Clock,
} from 'lucide-react';
import { useAuthStore } from '../../store/useStore';
import api from '../../utils/api';
import type { RefundRequest as RefundRequestType } from '../../../shared/types';

export default function StudentRefund() {
  const { student, user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'apply' | 'history'>('apply');
  const [reason, setReason] = useState('');
  const [refundInfo, setRefundInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [refundHistory, setRefundHistory] = useState<RefundRequestType[]>([]);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (student) {
      calculateRefund();
      fetchRefundHistory();
    }
  }, [student]);

  const calculateRefund = async () => {
    setIsLoading(true);
    try {
      const response = await api.get<any>(`/refunds/calculate/${student?.id}`);
      if (response.success) {
        setRefundInfo(response);
      }
    } catch (error) {
      console.error('Calculate refund error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRefundHistory = async () => {
    try {
      const response = await api.get<any>(
        `/refunds?studentId=${student?.id}`
      );
      if (response.success) {
        setRefundHistory(response.requests || []);
      }
    } catch (error) {
      console.error('Fetch refund history error:', error);
    }
  };

  const handleSubmit = () => {
    if (!reason.trim()) {
      setMessage({ type: 'error', text: '请填写退费原因' });
      return;
    }
    setShowConfirm(true);
  };

  const confirmRefund = async () => {
    setIsSubmitting(true);
    setShowConfirm(false);

    try {
      const response = await api.post<any>('/refunds', {
        studentId: student?.id,
        reason,
      });

      if (response.success) {
        setMessage({ type: 'success', text: '退费申请提交成功，请等待审批' });
        fetchRefundHistory();
        setReason('');
        setActiveTab('history');
      } else {
        setMessage({ type: 'error', text: response.message || '提交失败' });
      }
    } catch (error) {
      console.error('Submit refund error:', error);
      setMessage({ type: 'error', text: '提交失败，请稍后重试' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasPendingRefund = refundHistory.some((r) => r.status === 'pending');

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
    <Layout role="student" title="退费申请">
      <div className="space-y-6">
        <div className="bg-white rounded-xl border border-slate-100 p-6">
          <div className="flex gap-4 border-b border-slate-100 mb-6">
            <button
              onClick={() => setActiveTab('apply')}
              className={`pb-3 px-2 font-medium transition-colors relative ${
                activeTab === 'apply'
                  ? 'text-blue-600'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              申请退费
              {activeTab === 'apply' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`pb-3 px-2 font-medium transition-colors relative ${
                activeTab === 'history'
                  ? 'text-blue-600'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              退费记录
              {activeTab === 'history' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
              )}
            </button>
          </div>

          {activeTab === 'apply' && (
            <div>
              {hasPendingRefund && (
                <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-amber-800">您有待审批的退费申请</p>
                    <p className="text-sm text-amber-700 mt-1">
                      请等待财务审批，如有疑问请联系客服
                    </p>
                  </div>
                </div>
              )}

              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                </div>
              ) : refundInfo ? (
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-6">
                    <div className="bg-slate-50 rounded-xl p-5">
                      <h4 className="font-medium text-slate-800 mb-4">培训信息</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-slate-500">培训费用</span>
                          <span className="font-medium text-slate-800">
                            ¥{refundInfo.totalFee?.toLocaleString() || 0}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">总学时</span>
                          <span className="font-medium text-slate-800">
                            {refundInfo.totalHours || 0} 学时
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">已完成学时</span>
                          <span className="font-medium text-slate-800">
                            {refundInfo.completedHours || 0} 学时
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">完成进度</span>
                          <span className="font-medium text-blue-600">
                            {Math.round(
                              ((refundInfo.completedHours || 0) /
                                (refundInfo.totalHours || 1)) *
                                100
                            )}
                            %
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
                      <h4 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
                        <Wallet className="w-5 h-5" />
                        预计退款金额
                      </h4>
                      <p className="text-3xl font-bold text-blue-600">
                        ¥{refundInfo.refundAmount?.toLocaleString() || 0}
                      </p>
                      <p className="text-sm text-blue-700 mt-2">
                        系统根据已培训学时比例自动计算
                      </p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-slate-800 mb-4">退费原因</h4>
                    <textarea
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder="请详细描述您的退费原因..."
                      rows={8}
                      className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    />

                    {message.text && (
                      <div
                        className={`mt-4 p-3 rounded-lg ${
                          message.type === 'success'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-rose-50 text-rose-700'
                        }`}
                      >
                        {message.text}
                      </div>
                    )}

                    <button
                      onClick={handleSubmit}
                      disabled={hasPendingRefund || isSubmitting}
                      className="w-full mt-6 py-3 bg-rose-600 text-white font-medium rounded-lg hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          提交中...
                        </>
                      ) : (
                        '提交退费申请'
                      )}
                    </button>

                    <p className="text-xs text-slate-400 text-center mt-4">
                      提交后财务将在3-5个工作日内审批
                    </p>
                  </div>
                </div>
              ) : null}
            </div>
          )}

          {activeTab === 'history' && (
            <div>
              {refundHistory.length > 0 ? (
                <div className="space-y-4">
                  {refundHistory.map((request) => (
                    <div
                      key={request.id}
                      className="p-5 border border-slate-100 rounded-xl hover:border-slate-200 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-amber-100 rounded-lg">
                            <FileText className="w-5 h-5 text-amber-600" />
                          </div>
                          <div>
                            <h4 className="font-medium text-slate-800">
                              退费申请 #{request.id.slice(-8)}
                            </h4>
                            <p className="text-sm text-slate-500">
                              {request.createdAt}
                            </p>
                          </div>
                        </div>
                        <span
                          className={`px-3 py-1 text-sm rounded-full ${getStatusColor(
                            request.status
                          )}`}
                        >
                          {getStatusText(request.status)}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-4 pt-3 border-t border-slate-50">
                        <div>
                          <p className="text-xs text-slate-500 mb-1">申请金额</p>
                          <p className="font-semibold text-slate-800">
                            ¥{request.refundAmount.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 mb-1">已培训学时</p>
                          <p className="font-semibold text-slate-800">
                            {request.completedHours} 学时
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 mb-1">总学时</p>
                          <p className="font-semibold text-slate-800">
                            {request.totalHours} 学时
                          </p>
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t border-slate-50">
                        <p className="text-xs text-slate-500 mb-1">退费原因</p>
                        <p className="text-sm text-slate-700">{request.reason}</p>
                      </div>

                      {request.rejectReason && (
                        <div className="mt-3 p-3 bg-rose-50 rounded-lg">
                          <p className="text-xs text-rose-500 mb-1">拒绝原因</p>
                          <p className="text-sm text-rose-700">
                            {request.rejectReason}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-slate-400">
                  <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>暂无退费记录</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full mx-4">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-amber-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">
                确认提交退费申请？
              </h3>
              <p className="text-slate-500">
                预计退款金额：
                <span className="font-bold text-blue-600 text-lg">
                  ¥{refundInfo?.refundAmount?.toLocaleString() || 0}
                </span>
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-3 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50"
              >
                取消
              </button>
              <button
                onClick={confirmRefund}
                className="flex-1 py-3 bg-rose-600 text-white rounded-lg hover:bg-rose-700"
              >
                确认申请
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

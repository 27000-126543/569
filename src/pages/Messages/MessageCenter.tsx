import { useState, useEffect } from 'react';
import Layout from '../../components/Layout/Layout';
import {
  Bell,
  FileText,
  Wallet,
  GraduationCap,
  Newspaper,
  Check,
  CheckCheck,
  Download,
  X,
  FileCheck,
  CalendarCheck,
  UserPlus,
  Clock,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';
import { useMessageStore, useAuthStore } from '../../store/useStore';
import api from '../../utils/api';
import type { Message, MessageType } from '../../../shared/types';

const messageTypes: { value: MessageType | 'all'; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { value: 'all', label: '全部消息', icon: Bell },
  { value: 'system', label: '系统通知', icon: FileText },
  { value: 'exam', label: '考试提醒', icon: FileText },
  { value: 'refund', label: '退费通知', icon: Wallet },
  { value: 'training', label: '培训通知', icon: GraduationCap },
  { value: 'daily_report', label: '日报通知', icon: Newspaper },
];

const getTypeIcon = (type: MessageType) => {
  switch (type) {
    case 'system':
      return FileText;
    case 'exam':
      return FileText;
    case 'refund':
      return Wallet;
    case 'training':
      return GraduationCap;
    case 'daily_report':
      return Newspaper;
    default:
      return Bell;
  }
};

const getTypeColor = (type: MessageType) => {
  switch (type) {
    case 'system':
      return 'bg-blue-100 text-blue-600';
    case 'exam':
      return 'bg-emerald-100 text-emerald-600';
    case 'refund':
      return 'bg-amber-100 text-amber-600';
    case 'training':
      return 'bg-purple-100 text-purple-600';
    case 'daily_report':
      return 'bg-indigo-100 text-indigo-600';
    default:
      return 'bg-slate-100 text-slate-600';
  }
};

const getVoucherInfo = (relatedType?: string) => {
  switch (relatedType) {
    case 'registration':
      return {
        name: '报名凭证',
        icon: UserPlus,
        color: 'bg-blue-100 text-blue-600',
      };
    case 'exam_appointment':
    case 'exam_result':
      return {
        name: '考试凭证',
        icon: CalendarCheck,
        color: 'bg-emerald-100 text-emerald-600',
      };
    case 'refund':
    case 'refund_request':
    case 'refund_result':
      return {
        name: '退费审批凭证',
        icon: Wallet,
        color: 'bg-amber-100 text-amber-600',
      };
    case 'training_record':
      return {
        name: '培训学时凭证',
        icon: GraduationCap,
        color: 'bg-purple-100 text-purple-600',
      };
    case 'daily_report':
      return {
        name: '运营日报凭证',
        icon: FileCheck,
        color: 'bg-indigo-100 text-indigo-600',
      };
    default:
      return {
        name: '消息通知',
        icon: FileText,
        color: 'bg-slate-100 text-slate-600',
      };
  }
};

const getStatusText = (relatedType: string | undefined, data: any) => {
  if (!data) return '---';
  
  switch (relatedType) {
    case 'exam_appointment':
    case 'exam_result':
      switch (data.status) {
        case 'pending': return '待审核';
        case 'confirmed': return '已确认';
        case 'passed': return '已通过';
        case 'failed': return '未通过';
        case 'cancelled': return '已取消';
        default: return '---';
      }
    case 'refund':
    case 'refund_request':
    case 'refund_result':
      switch (data.status) {
        case 'pending': return '待审批';
        case 'approved': return '已通过';
        case 'rejected': return '已拒绝';
        default: return '---';
      }
    case 'training_record':
      return data.status === 'in_progress' ? '进行中' : '已完成';
    case 'registration':
      return '已报名';
    default:
      return '---';
  }
};

export default function MessageCenter({ role }: { role: string }) {
  const { user } = useAuthStore();
  const { messages, unreadCount, isLoading, fetchMessages, markAsRead, markAllAsRead } = useMessageStore();
  const [activeType, setActiveType] = useState<MessageType | 'all'>('all');
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [relatedData, setRelatedData] = useState<any>(null);
  const [loadingRelated, setLoadingRelated] = useState(false);

  useEffect(() => {
    if (user) {
      fetchMessages(user.id, activeType);
    }
  }, [user, activeType, fetchMessages]);

  const fetchRelatedData = async (message: Message) => {
    if (!message.relatedType || !message.relatedId) {
      setRelatedData(null);
      return;
    }

    setLoadingRelated(true);
    try {
      let data = null;
      
      switch (message.relatedType) {
        case 'exam_appointment':
        case 'exam_result': {
          const resp = await api.get<any>('/exam/appointments');
          if (resp.success) {
            data = resp.appointments?.find((a: any) => a.id === message.relatedId);
          }
          break;
        }
        case 'refund':
        case 'refund_request':
        case 'refund_result': {
          const resp = await api.get<any>('/refunds');
          if (resp.success) {
            data = resp.requests?.find((r: any) => r.id === message.relatedId);
          }
          break;
        }
        case 'training_record': {
          try {
            const resp = await api.get<any>(`/training/records/${message.relatedId}`);
            if (resp.success) {
              data = resp.record;
            }
          } catch (e) {
            console.error('Fetch training record error:', e);
          }
          break;
        }
        default:
          data = null;
      }
      
      setRelatedData(data);
    } catch (error) {
      console.error('Fetch related data error:', error);
      setRelatedData(null);
    } finally {
      setLoadingRelated(false);
    }
  };

  const handleMessageClick = (message: Message) => {
    setSelectedMessage(message);
    if (!message.isRead) {
      markAsRead(message.id);
    }
    fetchRelatedData(message);
  };

  const handleMarkAllRead = () => {
    if (user) {
      markAllAsRead(user.id);
    }
  };

  const handleDownloadVoucher = (messageId: string) => {
    const link = document.createElement('a');
    link.href = `/api/messages/${messageId}/voucher`;
    link.download = '';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const messagePagePath = {
    student: '/student/messages',
    coach: '/coach/messages',
    exam_admin: '/exam/messages',
    finance: '/finance/messages',
    principal: '/principal/messages',
  };

  const pageTitle = {
    student: '消息中心',
    coach: '消息中心',
    exam_admin: '消息中心',
    finance: '消息中心',
    principal: '消息中心',
  };

  return (
    <Layout role={role} title={pageTitle[role as keyof typeof pageTitle] || '消息中心'}>
      <div className="flex gap-6 h-[calc(100vh-140px)]">
        <div className="w-64 flex-shrink-0 bg-white rounded-xl border border-slate-100 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-800">消息分类</h3>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 text-xs bg-red-100 text-red-600 rounded-full">
                {unreadCount} 条未读
              </span>
            )}
          </div>

          <div className="space-y-1">
            {messageTypes.map((type) => {
              const Icon = type.icon;
              const isActive = activeType === type.value;

              return (
                <button
                  key={type.value}
                  onClick={() => setActiveType(type.value)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-sm font-medium">{type.label}</span>
                </button>
              );
            })}
          </div>

          <button
            onClick={handleMarkAllRead}
            className="w-full mt-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg flex items-center justify-center gap-2 transition-colors"
          >
            <CheckCheck className="w-4 h-4" />
            全部标记已读
          </button>
        </div>

        <div className="flex-1 bg-white rounded-xl border border-slate-100 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-slate-100">
            <h3 className="font-semibold text-slate-800">
              {messageTypes.find((t) => t.value === activeType)?.label}
            </h3>
          </div>

          <div className="flex-1 overflow-y-auto">
            {messages.length > 0 ? (
              <div className="divide-y divide-slate-50">
                {messages.map((message) => {
                  const Icon = getTypeIcon(message.type);
                  const isSelected = selectedMessage?.id === message.id;

                  return (
                    <div
                      key={message.id}
                      onClick={() => handleMessageClick(message)}
                      className={`p-4 cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-blue-50'
                          : message.isRead
                          ? 'hover:bg-slate-50'
                          : 'bg-blue-50/30 hover:bg-blue-50/50'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${getTypeColor(message.type)}`}>
                          <Icon className="w-5 h-5" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            {!message.isRead && (
                              <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                            )}
                            <h4
                              className={`font-medium truncate ${
                                message.isRead ? 'text-slate-600' : 'text-slate-800'
                              }`}
                            >
                              {message.title}
                            </h4>
                          </div>
                          <p className="text-sm text-slate-500 mt-1 line-clamp-2">
                            {message.content}
                          </p>
                          <p className="text-xs text-slate-400 mt-2">
                            {new Date(message.createdAt).toLocaleString('zh-CN')}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-400">
                <Bell className="w-12 h-12 mb-3 opacity-50" />
                <p>暂无消息</p>
              </div>
            )}
          </div>
        </div>

        {selectedMessage && (
          <div className="w-96 flex-shrink-0 bg-white rounded-xl border border-slate-100 flex flex-col overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-semibold text-slate-800">消息详情</h3>
              <button
                onClick={() => {
                  setSelectedMessage(null);
                  setRelatedData(null);
                }}
                className="p-1 hover:bg-slate-100 rounded"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-2 rounded-lg ${getTypeColor(selectedMessage.type)}`}>
                  {(() => {
                    const Icon = getTypeIcon(selectedMessage.type);
                    return <Icon className="w-5 h-5" />;
                  })()}
                </div>
                <div>
                  <h4 className="font-semibold text-slate-800">
                    {selectedMessage.title}
                  </h4>
                  <p className="text-xs text-slate-500">
                    {new Date(selectedMessage.createdAt).toLocaleString('zh-CN')}
                  </p>
                </div>
              </div>

              <div className="bg-slate-50 rounded-lg p-4 mb-4">
                <p className="text-slate-700 leading-relaxed">
                  {selectedMessage.content}
                </p>
              </div>

              {(selectedMessage.relatedType || selectedMessage.hasAttachment) && (
                <div className="border border-slate-200 rounded-xl p-4">
                  <h5 className="font-medium text-slate-800 mb-3 flex items-center gap-2">
                    <FileCheck className="w-4 h-4 text-blue-600" />
                    凭证信息
                  </h5>

                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">凭证类型</span>
                      <div className="flex items-center gap-1.5">
                        {(() => {
                          const voucherInfo = getVoucherInfo(selectedMessage.relatedType);
                          const VoucherIcon = voucherInfo.icon;
                          return (
                            <>
                              <span className={`p-1 rounded ${voucherInfo.color}`}>
                                <VoucherIcon className="w-3 h-3" />
                              </span>
                              <span className="font-medium text-slate-800">
                                {voucherInfo.name}
                              </span>
                            </>
                          );
                        })()}
                      </div>
                    </div>

                    {selectedMessage.relatedId && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">关联编号</span>
                        <span className="font-mono text-slate-800 text-xs">
                          {selectedMessage.relatedId}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">当前状态</span>
                      {loadingRelated ? (
                        <span className="text-slate-400 text-xs">加载中...</span>
                      ) : (
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          (() => {
                            const status = getStatusText(selectedMessage.relatedType, relatedData);
                            if (status === '已取消' || status === '已拒绝' || status === '未通过') {
                              return 'bg-rose-100 text-rose-700';
                            }
                            if (status === '已通过' || status === '已完成' || status === '已确认' || status === '已报名') {
                              return 'bg-emerald-100 text-emerald-700';
                            }
                            if (status === '进行中') {
                              return 'bg-amber-100 text-amber-700';
                            }
                            return 'bg-slate-100 text-slate-700';
                          })()
                        }`}>
                          {getStatusText(selectedMessage.relatedType, relatedData)}
                        </span>
                      )}
                    </div>

                    {relatedData?.rejectReason && (
                      <div className="pt-2 border-t border-slate-100">
                        <span className="text-slate-500 block mb-1">拒绝原因</span>
                        <p className="text-rose-600 text-xs bg-rose-50 p-2 rounded">
                          {relatedData.rejectReason}
                        </p>
                      </div>
                    )}

                    {relatedData?.refundAmount && (
                      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                        <span className="text-slate-500">退款金额</span>
                        <span className="font-semibold text-amber-600">
                          ¥{relatedData.refundAmount.toLocaleString()}
                        </span>
                      </div>
                    )}

                    {relatedData?.hours && (
                      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                        <span className="text-slate-500">本次学时</span>
                        <span className="font-semibold text-purple-600">
                          {relatedData.hours} 学时
                        </span>
                      </div>
                    )}

                    {relatedData?.examDate && (
                      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                        <span className="text-slate-500">考试时间</span>
                        <span className="font-medium text-slate-800">
                          {relatedData.examDate} {relatedData.examTime}
                        </span>
                      </div>
                    )}
                  </div>

                  {selectedMessage.hasAttachment && (
                    <div className="mt-4 pt-4 border-t border-slate-100">
                      <button
                        onClick={() => handleDownloadVoucher(selectedMessage.id)}
                        className="w-full py-3 border border-blue-200 text-blue-600 rounded-lg hover:bg-blue-50 flex items-center justify-center gap-2 transition-colors text-sm font-medium"
                      >
                        <Download className="w-4 h-4" />
                        下载凭证
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

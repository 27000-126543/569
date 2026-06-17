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
} from 'lucide-react';
import { useMessageStore, useAuthStore } from '../../store/useStore';
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

export default function MessageCenter({ role }: { role: string }) {
  const { user } = useAuthStore();
  const { messages, unreadCount, isLoading, fetchMessages, markAsRead, markAllAsRead } = useMessageStore();
  const [activeType, setActiveType] = useState<MessageType | 'all'>('all');
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);

  useEffect(() => {
    if (user) {
      fetchMessages(user.id, activeType);
    }
  }, [user, activeType, fetchMessages]);

  const handleMessageClick = (message: Message) => {
    setSelectedMessage(message);
    if (!message.isRead) {
      markAsRead(message.id);
    }
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
                onClick={() => setSelectedMessage(null)}
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

              <div className="bg-slate-50 rounded-lg p-4">
                <p className="text-slate-700 leading-relaxed">
                  {selectedMessage.content}
                </p>
              </div>

              {selectedMessage.hasAttachment && (
                <div className="mt-4">
                  <p className="text-sm text-slate-500 mb-2">附件凭证</p>
                  <button
                    onClick={() => handleDownloadVoucher(selectedMessage.id)}
                    className="w-full py-3 border border-blue-200 text-blue-600 rounded-lg hover:bg-blue-50 flex items-center justify-center gap-2 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    下载凭证
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

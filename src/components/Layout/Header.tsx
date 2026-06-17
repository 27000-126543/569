import { Bell, Search } from 'lucide-react';
import { useMessageStore } from '../../store/useStore';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useStore';

const roleMessagePaths: Record<string, string> = {
  student: '/student/messages',
  coach: '/coach/messages',
  exam_admin: '/exam/messages',
  finance: '/finance/messages',
  principal: '/principal/messages',
};

export default function Header({ title }: { title: string }) {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { unreadCount } = useMessageStore();

  const handleMessageClick = () => {
    const path = roleMessagePaths[user?.role || 'student'];
    navigate(path);
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-10">
      <div className="flex items-center gap-4">
        <h2 className="text-lg font-semibold text-slate-800">{title}</h2>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="搜索..."
            className="pl-10 pr-4 py-2 w-64 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <button
          onClick={handleMessageClick}
          className="relative p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}

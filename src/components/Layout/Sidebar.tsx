import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  UserPlus,
  CalendarClock,
  Clock,
  FileText,
  Wallet,
  MessageSquare,
  QrCode,
  Users,
  BarChart3,
  DoorOpen,
  CalendarCheck,
  CheckCircle,
  FileBarChart,
  Newspaper,
  LogOut,
} from 'lucide-react';
import { useAuthStore } from '../../store/useStore';
import { cn } from '../../lib/utils';

interface SidebarItem {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
}

const studentMenu: SidebarItem[] = [
  { label: '首页', icon: LayoutDashboard, path: '/student/dashboard' },
  { label: '在线报名', icon: UserPlus, path: '/student/register' },
  { label: '培训计划', icon: CalendarClock, path: '/student/training' },
  { label: '学时查询', icon: Clock, path: '/student/hours' },
  { label: '考试预约', icon: FileText, path: '/student/exam' },
  { label: '退费申请', icon: Wallet, path: '/student/refund' },
  { label: '消息中心', icon: MessageSquare, path: '/student/messages' },
];

const coachMenu: SidebarItem[] = [
  { label: '首页', icon: LayoutDashboard, path: '/coach/dashboard' },
  { label: '扫码签到', icon: QrCode, path: '/coach/signin' },
  { label: '学员管理', icon: Users, path: '/coach/students' },
  { label: '统计报表', icon: BarChart3, path: '/coach/statistics' },
  { label: '消息中心', icon: MessageSquare, path: '/coach/messages' },
];

const examMenu: SidebarItem[] = [
  { label: '首页', icon: LayoutDashboard, path: '/exam/dashboard' },
  { label: '考场管理', icon: DoorOpen, path: '/exam/rooms' },
  { label: '预约管理', icon: CalendarCheck, path: '/exam/appointments' },
  { label: '消息中心', icon: MessageSquare, path: '/exam/messages' },
];

const financeMenu: SidebarItem[] = [
  { label: '首页', icon: LayoutDashboard, path: '/finance/dashboard' },
  { label: '退费审批', icon: CheckCircle, path: '/finance/refunds' },
  { label: '消息中心', icon: MessageSquare, path: '/finance/messages' },
];

const principalMenu: SidebarItem[] = [
  { label: '首页', icon: LayoutDashboard, path: '/principal/dashboard' },
  { label: '数据报表', icon: FileBarChart, path: '/principal/reports' },
  { label: '运营日报', icon: Newspaper, path: '/principal/daily' },
  { label: '消息中心', icon: MessageSquare, path: '/principal/messages' },
];

const roleMenus: Record<string, SidebarItem[]> = {
  student: studentMenu,
  coach: coachMenu,
  exam_admin: examMenu,
  finance: financeMenu,
  principal: principalMenu,
};

const roleNames: Record<string, string> = {
  student: '学员端',
  coach: '教练端',
  exam_admin: '考场管理端',
  finance: '财务端',
  principal: '校长端',
};

export default function Sidebar({ role }: { role: string }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const menu = roleMenus[role] || [];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="h-screen w-64 bg-slate-900 text-white flex flex-col fixed left-0 top-0">
      <div className="p-6 border-b border-slate-700">
        <h1 className="text-xl font-bold text-blue-400">🚗 驾校管理平台</h1>
        <p className="text-sm text-slate-400 mt-1">{roleNames[role]}</p>
      </div>

      <nav className="flex-1 py-4 overflow-y-auto">
        {menu.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex items-center gap-3 px-6 py-3 text-sm transition-colors',
                isActive
                  ? 'bg-blue-600 text-white border-r-4 border-blue-400'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              )}
            >
              <Icon className="w-5 h-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-700 p-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center font-bold">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.name}</p>
            <p className="text-xs text-slate-400 truncate">{user?.phone}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" />
          退出登录
        </button>
      </div>
    </div>
  );
}

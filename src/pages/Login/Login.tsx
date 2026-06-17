import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  User,
  GraduationCap,
  ClipboardList,
  Wallet,
  Crown,
  Eye,
  EyeOff,
  Loader2,
} from 'lucide-react';
import { useAuthStore } from '../../store/useStore';
import { cn } from '../../lib/utils';

type RoleType = 'student' | 'coach' | 'exam_admin' | 'finance' | 'principal';

interface RoleOption {
  value: RoleType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

const roles: RoleOption[] = [
  { value: 'student', label: '学员', icon: User, description: '在线报名、培训学习、考试预约' },
  { value: 'coach', label: '教练', icon: GraduationCap, description: '扫码签到、学员管理、课时统计' },
  { value: 'exam_admin', label: '考场管理员', icon: ClipboardList, description: '考场管理、考试安排、准考证生成' },
  { value: 'finance', label: '财务', icon: Wallet, description: '退费审批、财务统计' },
  { value: 'principal', label: '校长', icon: Crown, description: '数据报表、运营管理、决策支持' },
];

export default function Login() {
  const [selectedRole, setSelectedRole] = useState<RoleType>('student');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading } = useAuthStore();

  const demoAccounts: Record<RoleType, string> = {
    student: 'student001',
    coach: 'coach001',
    exam_admin: 'examadmin001',
    finance: 'finance001',
    principal: 'principal001',
  };

  const handleRoleSelect = (role: RoleType) => {
    setSelectedRole(role);
    setUsername(demoAccounts[role]);
    setPassword('123456');
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username || !password) {
      setError('请输入用户名和密码');
      return;
    }

    const success = await login(username, password, selectedRole);

    if (success) {
      const redirectPaths: Record<RoleType, string> = {
        student: '/student/dashboard',
        coach: '/coach/dashboard',
        exam_admin: '/exam/dashboard',
        finance: '/finance/dashboard',
        principal: '/principal/dashboard',
      };

      const from = (location.state as { from?: string })?.from;
      navigate(from || redirectPaths[selectedRole], { replace: true });
    } else {
      setError('用户名或密码错误');
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="w-1/2 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 flex items-center justify-center p-12">
        <div className="text-white max-w-md">
          <h1 className="text-4xl font-bold mb-4">🚗 驾校管理平台</h1>
          <p className="text-blue-100 text-lg mb-8">
            专业的驾校学员培训与考试预约管理系统
          </p>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-sm">✓</span>
              </div>
              <div>
                <h3 className="font-semibold">智能教练匹配</h3>
                <p className="text-blue-200 text-sm">根据空闲时段和负荷自动匹配最优教练</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-sm">✓</span>
              </div>
              <div>
                <h3 className="font-semibold">全流程数字化</h3>
                <p className="text-blue-200 text-sm">从报名到拿证，全程在线管理</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-sm">✓</span>
              </div>
              <div>
                <h3 className="font-semibold">数据化运营</h3>
                <p className="text-blue-200 text-sm">多维数据报表，助力科学决策</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="w-1/2 flex items-center justify-center p-12 bg-slate-50">
        <div className="w-full max-w-md">
          <h2 className="text-2xl font-bold text-slate-800 mb-2">欢迎登录</h2>
          <p className="text-slate-500 mb-8">请选择您的角色并登录系统</p>

          <div className="grid grid-cols-5 gap-2 mb-6">
            {roles.map((role) => {
              const Icon = role.icon;
              const isSelected = selectedRole === role.value;
              return (
                <button
                  key={role.value}
                  type="button"
                  onClick={() => handleRoleSelect(role.value)}
                  className={cn(
                    'flex flex-col items-center gap-1 p-3 rounded-xl transition-all border-2',
                    isSelected
                      ? 'border-blue-500 bg-blue-50 text-blue-600'
                      : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-xs font-medium">{role.label}</span>
                </button>
              );
            })}
          </div>

          <p className="text-sm text-slate-400 mb-6">
            {roles.find(r => r.value === selectedRole)?.description}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                用户名
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="请输入用户名"
                className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                密码
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="请输入密码"
                  className="w-full px-4 py-3 pr-12 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-rose-50 text-rose-600 text-sm rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  登录中...
                </>
              ) : (
                '登 录'
              )}
            </button>

            <p className="text-center text-sm text-slate-400">
              演示账号密码均为：123456
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

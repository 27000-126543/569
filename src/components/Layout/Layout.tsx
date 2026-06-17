import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { useAuthStore } from '../../store/useStore';
import { useEffect } from 'react';
import { useMessageStore } from '../../store/useStore';

interface LayoutProps {
  children: ReactNode;
  role: string;
  title: string;
}

export default function Layout({ children, role, title }: LayoutProps) {
  const { user, token } = useAuthStore();
  const { fetchUnreadCount } = useMessageStore();

  useEffect(() => {
    if (user) {
      fetchUnreadCount(user.id);
    }
  }, [user, fetchUnreadCount]);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (user && user.role !== role) {
    const redirectPath = getDefaultPath(user.role);
    return <Navigate to={redirectPath} replace />;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar role={role} />
      <div className="ml-64">
        <Header title={title} />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}

function getDefaultPath(role: string): string {
  const paths: Record<string, string> = {
    student: '/student/dashboard',
    coach: '/coach/dashboard',
    exam_admin: '/exam/dashboard',
    finance: '/finance/dashboard',
    principal: '/principal/dashboard',
  };
  return paths[role] || '/login';
}

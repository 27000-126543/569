import { ReactNode } from 'react';
import { cn } from '../../lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  trend?: string;
  trendUp?: boolean;
  color?: 'blue' | 'green' | 'amber' | 'red' | 'purple';
}

const colorClasses = {
  blue: 'bg-blue-50 text-blue-600',
  green: 'bg-emerald-50 text-emerald-600',
  amber: 'bg-amber-50 text-amber-600',
  red: 'bg-rose-50 text-rose-600',
  purple: 'bg-purple-50 text-purple-600',
};

export default function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  trendUp,
  color = 'blue',
}: StatCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500 mb-1">{title}</p>
          <p className="text-2xl font-bold text-slate-800">{value}</p>
          {trend && (
            <p
              className={cn(
                'text-xs mt-2',
                trendUp ? 'text-emerald-600' : 'text-rose-600'
              )}
            >
              {trendUp ? '↑' : '↓'} {trend}
            </p>
          )}
        </div>
        <div className={cn('p-3 rounded-xl', colorClasses[color])}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}

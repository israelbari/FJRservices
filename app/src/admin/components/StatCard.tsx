import type { ReactNode } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  icon: ReactNode;
  iconBg: string;
  iconColor: string;
  value: string | number;
  label: string;
  subtext?: string;
  trend?: { value: string; direction: 'up' | 'down' } | null;
}

export default function StatCard({
  icon,
  iconBg,
  iconColor,
  value,
  label,
  subtext,
  trend,
}: StatCardProps) {
  return (
    <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 min-h-[140px] flex flex-col justify-between hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between">
        <div
          className="w-10 h-10 rounded-[10px] flex items-center justify-center"
          style={{ backgroundColor: iconBg }}
        >
          <span style={{ color: iconColor }}>{icon}</span>
        </div>
        <span className="text-[32px] font-bold leading-tight text-[#1E293B]">{value}</span>
      </div>
      <div className="mt-2">
        <p className="text-xs font-medium uppercase tracking-[0.05em] text-[#94A3B8]">
          {label}
        </p>
        {subtext && (
          <p className="text-[11px] text-[#94A3B8] mt-0.5">{subtext}</p>
        )}
        {trend && (
          <div className="flex items-center gap-1 mt-1">
            {trend.direction === 'up' ? (
              <TrendingUp className="w-3.5 h-3.5 text-[#10B981]" />
            ) : (
              <TrendingDown className="w-3.5 h-3.5 text-[#EF4444]" />
            )}
            <span
              className="text-[13px] font-medium"
              style={{ color: trend.direction === 'up' ? '#10B981' : '#EF4444' }}
            >
              {trend.value}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

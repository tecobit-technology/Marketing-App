import React from 'react';

interface StatCardProps {
  label: string;
  value: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  icon?: React.ReactNode;
}

export default function StatCard({ label, value, trend, icon }: StatCardProps) {
  return (
    <div className="flex flex-col rounded-xl border border-border-default bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-text-muted">{label}</p>
        {icon && <div className="text-brand-primary">{icon}</div>}
      </div>
      <div className="mt-4 flex items-baseline gap-2">
        <h3 className="text-2xl font-bold text-text-heading">{value}</h3>
        {trend && (
          <span className={`text-xs font-semibold ${trend.isPositive ? 'text-success-500' : 'text-error-500'}`}>
            {trend.isPositive ? '+' : ''}{trend.value}
          </span>
        )}
      </div>
    </div>
  );
}

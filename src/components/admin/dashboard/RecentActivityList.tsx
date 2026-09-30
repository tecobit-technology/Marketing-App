import React from 'react';

export interface ActivityItem {
  id: string;
  title: string;
  description: string;
  time: string;
  type: 'patient' | 'system' | 'billing';
}

interface RecentActivityListProps {
  activities: ActivityItem[];
}

export default function RecentActivityList({ activities }: RecentActivityListProps) {
  const getIcon = (type: ActivityItem['type']) => {
    switch(type) {
      case 'patient':
        return (
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-tint text-brand-primary">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
          </div>
        );
      case 'billing':
        return (
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-success-100 text-success-500">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
          </div>
        );
      default:
        return (
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-text-muted">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
          </div>
        );
    }
  };

  return (
    <div className="rounded-xl border border-border-default bg-white p-5 shadow-sm">
      <h3 className="text-lg font-semibold text-text-heading mb-4">Recent Activity</h3>
      <div className="flex flex-col gap-5">
        {activities.map((activity) => (
          <div key={activity.id} className="flex gap-4">
            {getIcon(activity.type)}
            <div className="flex-1">
              <p className="text-sm font-medium text-text-heading">{activity.title}</p>
              <p className="text-xs text-text-muted mt-0.5">{activity.description}</p>
            </div>
            <span className="text-xs text-text-muted whitespace-nowrap">{activity.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

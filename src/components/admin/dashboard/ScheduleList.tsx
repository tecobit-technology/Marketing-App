import React from 'react';

export interface ScheduleItem {
  id: string;
  time: string;
  patientName: string;
  type: string;
  status: 'In Room' | 'Waiting' | 'Completed' | 'No Show' | 'Confirmed' | string;
}

interface ScheduleListProps {
  items: ScheduleItem[];
  title: string;
}

export default function ScheduleList({ items, title }: ScheduleListProps) {
  const getStatusBadge = (status: ScheduleItem['status']) => {
    switch (status) {
      case 'In Room':
        return <span className="rounded-full bg-success-500 px-2.5 py-1 text-xs font-medium text-white">In Room</span>;
      case 'Waiting':
        return <span className="rounded-full bg-warning-100 px-2.5 py-1 text-xs font-medium text-warning-500">Waiting</span>;
      case 'Completed':
        return <span className="rounded-full bg-neutral-200 px-2.5 py-1 text-xs font-medium text-text-muted">Completed</span>;
      case 'No Show':
        return <span className="rounded-full bg-error-100 px-2.5 py-1 text-xs font-medium text-error-500">No Show</span>;
      case 'Confirmed':
        return <span className="rounded-full bg-info-100 px-2.5 py-1 text-xs font-medium text-info-500">Confirmed</span>;
      default:
        return <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-medium text-text-body">{status}</span>;
    }
  };

  return (
    <div className="rounded-xl border border-border-default bg-white p-5 shadow-sm">
      <h3 className="text-lg font-semibold text-text-heading mb-4">{title}</h3>
      <div className="flex flex-col gap-4">
        {items.map((item) => (
          <div key={item.id} className="flex items-center justify-between border-b border-border-default pb-4 last:border-0 last:pb-0">
            <div className="flex items-center gap-4">
              <div className="w-16 whitespace-nowrap text-sm font-medium text-text-heading">
                {item.time}
              </div>
              <div>
                <p className="text-sm font-medium text-text-heading">{item.patientName}</p>
                <p className="text-xs text-text-muted">{item.type}</p>
              </div>
            </div>
            <div>
              {getStatusBadge(item.status)}
            </div>
          </div>
        ))}
        {items.length === 0 && (
          <p className="text-sm text-text-muted py-4 text-center">No appointments scheduled.</p>
        )}
      </div>
    </div>
  );
}

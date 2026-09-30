import React from 'react';
import Link from 'next/link';

interface PageHeaderProps {
  title: string;
  description: string;
  action?: {
    label: string;
    onClick?: () => void;
    href?: string;
  };
}

export default function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h2 className="text-2xl font-bold text-text-heading">{title}</h2>
        <p className="text-sm text-text-muted mt-1">{description}</p>
      </div>
      {action && (
        <div className="flex shrink-0">
          {action.href ? (
            <Link 
              href={action.href}
              className="inline-flex items-center justify-center rounded-md bg-brand-primary px-4 py-2 text-sm font-medium text-white hover:bg-brand-primary-hover shadow-sm transition-colors"
            >
              {action.label}
            </Link>
          ) : (
            <button 
              onClick={action.onClick}
              className="inline-flex items-center justify-center rounded-md bg-brand-primary px-4 py-2 text-sm font-medium text-white hover:bg-brand-primary-hover shadow-sm transition-colors"
            >
              {action.label}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

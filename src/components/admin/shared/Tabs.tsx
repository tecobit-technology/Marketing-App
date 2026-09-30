"use client";

import React, { useState } from 'react';

interface TabListProps {
  tabs: {
    id: string;
    label: string;
    content: React.ReactNode;
  }[];
}

export default function Tabs({ tabs }: TabListProps) {
  const [activeTab, setActiveTab] = useState(tabs[0]?.id);

  if (!tabs.length) return null;

  const currentTabContent = tabs.find(t => t.id === activeTab)?.content;

  return (
    <div className="flex flex-col w-full">
      <div className="border-b border-border-default w-full overflow-x-auto no-scrollbar">
        <nav className="flex gap-6 px-1" aria-label="Tabs">
          {tabs.map((tab) => {
            const isActive = tab.id === activeTab;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`whitespace-nowrap px-1 py-4 text-sm font-medium border-b-2 transition-colors ${
                  isActive 
                    ? "border-brand-primary text-brand-primary" 
                    : "border-transparent text-text-muted hover:border-border-strong hover:text-text-heading"
                }`}
                aria-current={isActive ? "page" : undefined}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>
      <div className="py-6">
        {currentTabContent}
      </div>
    </div>
  );
}

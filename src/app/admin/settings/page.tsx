"use client";

import React from 'react';
import PageHeader from '@/components/admin/shared/PageHeader';

export default function SettingsPage() {
  return (
    <div className="space-y-6 max-w-5xl">
      <PageHeader 
        title="Settings" 
        description="Configure your clinic details, integrations, and preferences."
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mt-6">
        {/* Settings Navigation */}
        <div className="md:col-span-1">
          <nav className="flex flex-row md:flex-col gap-1 overflow-x-auto md:overflow-visible pb-2 md:pb-0">
            <a href="#" className="whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium bg-brand-primary text-white shadow-sm">Clinic Profile</a>
            <a href="#" className="whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium text-text-body hover:bg-neutral-100">Users & Roles</a>
            <a href="#" className="whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium text-text-body hover:bg-neutral-100">Billing Settings</a>
            <a href="#" className="whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium text-text-body hover:bg-neutral-100">Integrations</a>
          </nav>
        </div>

        {/* Settings Content Area */}
        <div className="md:col-span-3 space-y-6">
          <div className="rounded-xl border border-border-default bg-white shadow-sm overflow-hidden">
            <div className="border-b border-border-default px-6 py-4">
              <h3 className="text-lg font-semibold text-text-heading">Clinic Profile</h3>
              <p className="text-sm text-text-muted">Update your clinic&apos;s public-facing information.</p>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2 text-left">
                  <label className="text-sm font-medium text-text-heading">Clinic Name</label>
                  <input type="text" className="w-full rounded-md border border-border-default px-4 py-2 text-sm focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary" defaultValue="MySaas Dental Clinic" />
                </div>
                <div className="space-y-2 text-left">
                  <label className="text-sm font-medium text-text-heading">Support Email</label>
                  <input type="email" className="w-full rounded-md border border-border-default px-4 py-2 text-sm focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary" defaultValue="support@clinic.com" />
                </div>
                <div className="space-y-2 sm:col-span-2 text-left">
                  <label className="text-sm font-medium text-text-heading">Address</label>
                  <textarea rows={3} className="w-full rounded-md border border-border-default px-4 py-2 text-sm focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary" defaultValue="123 Dental Lane&#10;Cityville, State 12345" />
                </div>
              </div>
            </div>
            
            <div className="border-t border-border-default bg-neutral-50 px-6 py-4 flex justify-end">
              <button className="rounded-md bg-brand-primary px-4 py-2 text-sm font-medium text-white hover:bg-brand-primary-hover shadow-sm transition-colors">
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

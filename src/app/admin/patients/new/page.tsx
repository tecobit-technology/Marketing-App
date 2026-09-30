
"use client"; 
 
import React from 'react'; 
import PageHeader from '@/components/admin/shared/PageHeader'; 
import { useRouter } from 'next/navigation'; 
 
export default function AddPatientPage() { 
  const router = useRouter(); 
 
  return ( 
    <div className="space-y-6"> 
      <PageHeader  
        title="Add New Patient"  
        description="Enter new patient information to create a clinic record." 
      /> 
 
      <div className="rounded-xl border border-border-default bg-white p-6 shadow-sm"> 
        <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); router.push('/admin/patients'); }}> 
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6"> 
            <div className="space-y-2"> 
              <label className="text-sm font-medium text-text-heading">First Name</label> 
              <input required type="text" className="w-full rounded-md border border-border-default px-4 py-2 text-sm focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary transition-shadow" placeholder="Sita" /> 
            </div> 
 
            <div className="space-y-2"> 
              <label className="text-sm font-medium text-text-heading">Last Name</label> 
              <input required type="text" className="w-full rounded-md border border-border-default px-4 py-2 text-sm focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary transition-shadow" placeholder="Rai" /> 
            </div> 
 
            <div className="space-y-2"> 
              <label className="text-sm font-medium text-text-heading">Email Address</label> 
              <input type="email" className="w-full rounded-md border border-border-default px-4 py-2 text-sm focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary transition-shadow" placeholder="sita@example.com" /> 
            </div> 
 
            <div className="space-y-2"> 
              <label className="text-sm font-medium text-text-heading">Phone Number</label> 
              <input required type="tel" className="w-full rounded-md border border-border-default px-4 py-2 text-sm focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary transition-shadow" placeholder="+977" /> 
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-text-heading">Date of Birth</label>
              <input type="date" className="w-full rounded-md border border-border-default px-4 py-2 text-sm focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary transition-shadow" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-text-heading">Address</label>
              <input type="text" className="w-full rounded-md border border-border-default px-4 py-2 text-sm focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary transition-shadow" placeholder="Kathmandu, Nepal" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-text-heading">Insurance</label>
              <input type="text" className="w-full rounded-md border border-border-default px-4 py-2 text-sm focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary transition-shadow" placeholder="Insurance provider" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-text-heading">Medical History</label>
              <input type="text" className="w-full rounded-md border border-border-default px-4 py-2 text-sm focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary transition-shadow" placeholder="Medical history" />
            </div>
          </div> 
           
          <div className="flex justify-end gap-3 pt-4 border-t border-border-default mt-6"> 
            <button type="button" onClick={() => router.back()} className="rounded-md border border-border-default px-4 py-2 text-sm font-medium text-text-heading hover:bg-neutral-50 transition-colors"> 
              Cancel 
            </button> 
            <button type="submit" className="rounded-md bg-brand-primary px-4 py-2 text-sm font-medium text-white hover:bg-brand-primary-hover shadow-sm transition-colors"> 
              Save Patient 
            </button> 
          </div> 
        </form> 
      </div> 
    </div> 
  ); 
}

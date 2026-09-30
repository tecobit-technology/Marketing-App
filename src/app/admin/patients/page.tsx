import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import PageHeader from "@/components/admin/shared/PageHeader";
import AdminPatientsTable, {
  AdminPatient,
} from "./AdminPatientsTable";

import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { Patient } from "@/lib/models";

export default async function PatientsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  if (session.user.role === "patient") {
    redirect("/portal");
  }

  const clinicId = session.user.clinicId;

  if (!clinicId) {
    redirect("/admin");
  }

  await connectToDatabase();

  const patients = await Patient.find({
    clinicId,
  })
    .sort({ createdAt: -1 })
    .lean();

  const formattedPatients: AdminPatient[] = patients.map((patient: any) => ({
    id: patient._id.toString(),
    name: patient.fullName,
    email: patient.email || "",
    phone: patient.phone || "",
    lastVisit: "—",
    status: "Active",
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Patients"
        description="Manage patient records, history, and details."
        action={{
          label: "Add Patient",
          href: "/admin/patients/new",
        }}
      />

      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-4 rounded-xl border border-border-default shadow-sm">
        <div className="relative w-full sm:max-w-xs">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>

          <input
            type="text"
            placeholder="Search patients..."
            className="w-full rounded-md border border-border-default pl-10 pr-4 py-2 text-sm focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
          />
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <select className="w-full sm:w-auto rounded-md border border-border-default px-4 py-2 text-sm bg-white focus:outline-none focus:border-brand-primary text-text-body">
            <option>All Statuses</option>
            <option>Active</option>
            <option>Inactive</option>
          </select>
        </div>
      </div>

      <AdminPatientsTable patients={formattedPatients} />
    </div>
  );
}
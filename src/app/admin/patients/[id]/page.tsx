import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import mongoose from "mongoose";

import PageHeader from "@/components/admin/shared/PageHeader";
import Tabs from "@/components/admin/shared/Tabs";

import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { Patient } from "@/lib/models";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function PatientDetailsPage({ params }: Props) {
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

  const { id } = await params;

  if (!mongoose.isValidObjectId(id)) {
    notFound();
  }

  await connectToDatabase();

  const patient = await Patient.findOne({
    _id: id,
    clinicId,
  }).lean();

  if (!patient) {
    notFound();
  }

  const patientName = patient.fullName || "Unnamed Patient";

  const initials = patientName
    .split(" ")
    .map((name: string) => name.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const registeredDate = patient.createdAt
    ? new Date(patient.createdAt).toLocaleDateString()
    : "—";

  const dob = patient.dob
    ? new Date(patient.dob).toLocaleDateString()
    : "—";

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Patient: ${patientName}`}
        description={`ID: ${patient._id.toString()} • Registered: ${registeredDate}`}
        action={{
          label: "Edit Patient",
          href: `/admin/patients/${patient._id.toString()}/edit`,
        }}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Patient Information */}
        <div className="md:col-span-1 border border-border-default rounded-xl bg-white p-6 shadow-sm h-min">
          <div className="flex flex-col items-center text-center pb-6 border-b border-border-default">
            <div className="h-20 w-20 rounded-full bg-brand-tint text-brand-primary flex items-center justify-center text-2xl font-bold mb-4">
              {initials}
            </div>

            <h3 className="text-lg font-bold text-text-heading">
              {patientName}
            </h3>

            <span className="mt-1 inline-flex rounded-full bg-success-100 px-2 py-0.5 text-xs font-medium text-success-500">
              Active
            </span>
          </div>

          <div className="pt-6 space-y-4">
            <div>
              <p className="text-xs text-text-muted">Phone</p>
              <p className="text-sm font-medium text-text-heading mt-0.5">
                {patient.phone || "—"}
              </p>
            </div>

            <div>
              <p className="text-xs text-text-muted">Email</p>
              <p className="text-sm font-medium text-text-heading mt-0.5">
                {patient.email || "—"}
              </p>
            </div>

            <div>
              <p className="text-xs text-text-muted">DOB</p>
              <p className="text-sm font-medium text-text-heading mt-0.5">
                {dob}
              </p>
            </div>

            <div>
              <p className="text-xs text-text-muted">Address</p>
              <p className="text-sm font-medium text-text-heading mt-0.5">
                {patient.address || "—"}
              </p>
            </div>

            <div>
              <p className="text-xs text-text-muted">Insurance</p>
              <p className="text-sm font-medium text-text-heading mt-0.5">
                {patient.insurance || "—"}
              </p>
            </div>
          </div>
        </div>

        {/* Patient Details */}
        <div className="md:col-span-2 border border-border-default rounded-xl bg-white p-6 shadow-sm">
          <Tabs
            tabs={[
              {
                id: "overview",
                label: "Overview",
                content: (
                  <div className="space-y-6">
                    <h4 className="text-base font-semibold text-text-heading">
                      Patient Overview
                    </h4>

                    <div className="rounded-lg border border-border-default p-4">
                      <p className="text-sm text-text-muted">
                        Medical History
                      </p>

                      <p className="mt-2 text-sm text-text-body">
                        {patient.medicalHistory?.length
                          ? patient.medicalHistory.join(", ")
                          : "No medical history recorded."}
                      </p>
                    </div>
                  </div>
                ),
              },

              {
                id: "clinical",
                label: "Clinical History",
                content: (
                  <div className="space-y-6">
                    <h4 className="text-base font-semibold text-text-heading">
                      Clinical History
                    </h4>

                    <div className="rounded-lg border border-border-default p-4 text-center">
                      <p className="text-sm text-text-muted">
                        No clinical records found for this patient.
                      </p>
                    </div>
                  </div>
                ),
              },

              {
                id: "billing",
                label: "Billing",
                content: (
                  <div className="space-y-6">
                    <h4 className="text-base font-semibold text-text-heading">
                      Outstanding Balance
                    </h4>

                    <p className="text-3xl font-bold text-text-heading">
                      $0.00
                    </p>
                  </div>
                ),
              },
            ]}
          />
        </div>
      </div>
    </div>
  );
}
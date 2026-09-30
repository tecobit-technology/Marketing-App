"use client";

import React, { useEffect, useState } from "react";
import { Plus, Eye } from "lucide-react";
import { useRouter } from "next/navigation";
import PageHeader from "@/components/admin/shared/PageHeader";
import Tabs from "@/components/admin/shared/Tabs";
import DataTable, { Column } from "@/components/admin/shared/DataTable";
import StatusBadge from "@/components/admin/shared/StatusBadge";

interface Patient {
  _id: string;
  fullName: string;
  phone?: string;
  email?: string;
}

interface TreatmentPlanItem {
  procedure: string;
  cost: number;
  priority: number;
}

interface TreatmentPlan {
  _id: string;
  patientId: Patient;
  title: string;
  status: "draft" | "in-progress" | "accepted" | "completed";
  items: TreatmentPlanItem[];
  notes: string;
  createdAt: string;
}

interface PlanTableRow {
  id: string;
  patient: string;
  title: string;
  date: string;
  status: string;
  planId: string;
}
interface ClinicalNote {
  _id: string;
  patientId: Patient;
  clinicianId?: {
    _id: string;
    name: string;
  } | null;
  title: string;
  note: string;
  createdAt: string;
}

interface NoteTableRow {
  id: string;
  patient: string;
  title: string;
  clinician: string;
  date: string;
  noteId: string;
}

export default function ClinicalPage() {
  const router = useRouter();

  const [plans, setPlans] = useState<TreatmentPlan[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [clinicalNotes, setClinicalNotes] = useState<ClinicalNote[]>([]);
  const [notesLoading, setNotesLoading] = useState(true);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [showForm, setShowForm] = useState(false);

  const [patientId, setPatientId] = useState("");
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState<
    "draft" | "in-progress"
  >("in-progress");

  const [procedure, setProcedure] = useState("");
  const [cost, setCost] = useState("");
  const [priority, setPriority] = useState("1");
  const [notes, setNotes] = useState("");

  const [error, setError] = useState("");

  const fetchPlans = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/treatment-plans");

      if (!response.ok) {
        throw new Error("Failed to fetch treatment plans");
      }

      const data = await response.json();
      setPlans(data);
    } catch (error) {
      console.error(error);
      setError("Failed to load treatment plans.");
    } finally {
      setLoading(false);
    }
  };

  const fetchPatients = async () => {
    try {
      const response = await fetch("/api/patients");

      if (!response.ok) {
        throw new Error("Failed to fetch patients");
      }

      const data = await response.json();
      setPatients(data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchClinicalNotes = async () => {
    try {
      setNotesLoading(true);

      const response = await fetch("/api/clinical-notes");

      if (!response.ok) {
        throw new Error("Failed to fetch clinical notes");
      }

      const data = await response.json();
      setClinicalNotes(data);
    } catch (error) {
      console.error(error);
    } finally {
      setNotesLoading(false);
    }
  };

  useEffect(() => {
    const loadClinicalData = async () => {
      await Promise.all([
        fetchPlans(),
        fetchPatients(),
        fetchClinicalNotes(),
      ]);
    };

    void loadClinicalData();
  }, []);

  const resetForm = () => {
    setPatientId("");
    setTitle("");
    setStatus("in-progress");
    setProcedure("");
    setCost("");
    setPriority("1");
    setNotes("");
    setError("");
  };

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!patientId) {
      setError("Please select a patient.");
      return;
    }

    if (!title.trim()) {
      setError("Please enter a treatment title.");
      return;
    }

    if (!procedure.trim()) {
      setError("Please enter a procedure.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const response = await fetch("/api/treatment-plans", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          patientId,
          title,
          status,
          items: [
            {
              procedure,
              cost: Number(cost) || 0,
              priority: Number(priority) || 1,
            },
          ],
          notes,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to create treatment plan"
        );
      }

      await fetchPlans();

      resetForm();
      setShowForm(false);
    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error
          ? error.message
          : "Failed to create treatment plan."
      );
    } finally {
      setSaving(false);
    }
  };

  const planRows: PlanTableRow[] = plans.map((plan) => ({
    id: plan._id.slice(-6).toUpperCase(),
    patient: plan.patientId?.fullName || "Unknown Patient",
    title: plan.title,
    date: new Date(plan.createdAt).toLocaleDateString(),
    status:
      plan.status === "in-progress"
        ? "In Progress"
        : plan.status.charAt(0).toUpperCase() + plan.status.slice(1),
    planId: plan._id,
  }));

  const noteRows: NoteTableRow[] = clinicalNotes.map((note) => ({
    id: note._id.slice(-6).toUpperCase(),
    patient: note.patientId?.fullName || "Unknown Patient",
    title: note.title,
    clinician: note.clinicianId?.name || "Unknown",
    date: new Date(note.createdAt).toLocaleDateString(),
    noteId: note._id,
  }));

  const planColumns: Column<PlanTableRow>[] = [
    {
      key: "id",
      label: "Plan ID",
    },
    {
      key: "patient",
      label: "Patient",
    },
    {
      key: "title",
      label: "Treatment Title",
    },
    {
      key: "date",
      label: "Date Created",
    },
    {
      key: "status",
      label: "Status",
      render: (plan) => <StatusBadge status={plan.status} />,
    },
    {
      key: "actions",
      label: "Action",
      render: (plan) => (
        <button
          type="button"
          onClick={() =>
            router.push(`/admin/clinical/${plan.planId}`)
          }
          className="rounded-md border border-border-default bg-white px-3 py-1.5 text-xs font-medium text-text-heading shadow-sm transition hover:bg-neutral-50"
        >
          Details
        </button>
      ),
    },
  ];

  const noteColumns: Column<NoteTableRow>[] = [
    {
      key: "id",
      label: "Note ID",
    },
    {
      key: "patient",
      label: "Patient",
    },
    {
      key: "title",
      label: "Note Title",
    },
    {
      key: "clinician",
      label: "Clinician",
    },
    {
      key: "date",
      label: "Date",
    },
    {
      key: "actions",
      label: "Action",
      render: (note) => (
        <button
          type="button"
          onClick={() =>
            router.push(`/admin/clinical/notes/${note.noteId}`)
          }
          className="inline-flex items-center gap-1.5 rounded-md border border-border-default bg-white px-3 py-1.5 text-xs font-medium text-text-heading shadow-sm transition hover:bg-neutral-50"
        >
          <Eye size={14} strokeWidth={2} />
          Details
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Clinical"
        description="Patient healthcare information, notes, and treatment plans."
        action={{
          label: "New Treatment Plan",
          onClick: () => {
            setError("");
            setShowForm(true);
          },
        }}
      />

      <div className="rounded-xl border border-border-default bg-white p-6 shadow-sm">
        <Tabs
          tabs={[
            {
              id: "plans",
              label: "Treatment Plans",
              content: (
                <div className="space-y-4">
                  {showForm && (
                    <div className="rounded-xl border border-border-default bg-neutral-50 p-5">
                      <div className="mb-5 flex items-center justify-between">
                        <div>
                          <h3 className="text-base font-semibold text-text-heading">
                            Create Treatment Plan
                          </h3>

                          <p className="mt-1 text-sm text-text-muted">
                            Create a treatment plan for a patient.
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            resetForm();
                            setShowForm(false);
                          }}
                          className="text-sm font-medium text-text-muted hover:text-text-heading"
                        >
                          Cancel
                        </button>
                      </div>

                      <form
                        onSubmit={handleCreatePlan}
                        className="space-y-5"
                      >
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                          <div>
                            <label className="mb-1.5 block text-sm font-medium text-text-heading">
                              Patient
                            </label>

                            <select
                              value={patientId}
                              onChange={(e) =>
                                setPatientId(e.target.value)
                              }
                              className="w-full rounded-lg border border-border-default bg-white px-3 py-2.5 text-sm outline-none focus:border-brand-primary"
                            >
                              <option value="">
                                Select patient
                              </option>

                              {patients.map((patient) => (
                                <option
                                  key={patient._id}
                                  value={patient._id}
                                >
                                  {patient.fullName}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="mb-1.5 block text-sm font-medium text-text-heading">
                              Treatment Title
                            </label>

                            <input
                              type="text"
                              value={title}
                              onChange={(e) =>
                                setTitle(e.target.value)
                              }
                              placeholder="e.g. Full Mouth Restoration"
                              className="w-full rounded-lg border border-border-default bg-white px-3 py-2.5 text-sm outline-none focus:border-brand-primary"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                          <div>
                            <label className="mb-1.5 block text-sm font-medium text-text-heading">
                              Procedure
                            </label>

                            <input
                              type="text"
                              value={procedure}
                              onChange={(e) =>
                                setProcedure(e.target.value)
                              }
                              placeholder="e.g. Dental Filling"
                              className="w-full rounded-lg border border-border-default bg-white px-3 py-2.5 text-sm outline-none focus:border-brand-primary"
                            />
                          </div>

                          <div>
                            <label className="mb-1.5 block text-sm font-medium text-text-heading">
                              Cost
                            </label>

                            <input
                              type="number"
                              min="0"
                              value={cost}
                              onChange={(e) =>
                                setCost(e.target.value)
                              }
                              placeholder="0"
                              className="w-full rounded-lg border border-border-default bg-white px-3 py-2.5 text-sm outline-none focus:border-brand-primary"
                            />
                          </div>

                          <div>
                            <label className="mb-1.5 block text-sm font-medium text-text-heading">
                              Priority
                            </label>

                            <select
                              value={priority}
                              onChange={(e) =>
                                setPriority(e.target.value)
                              }
                              className="w-full rounded-lg border border-border-default bg-white px-3 py-2.5 text-sm outline-none focus:border-brand-primary"
                            >
                              <option value="1">1 - High</option>
                              <option value="2">2 - Medium</option>
                              <option value="3">3 - Low</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="mb-1.5 block text-sm font-medium text-text-heading">
                            Status
                          </label>

                          <div className="rounded-lg border border-border-default bg-white px-3 py-2.5 text-sm text-text-body">
                            In Progress
                          </div>

                          <p className="mt-1 text-xs text-text-muted">
                            New treatment plans start as In Progress.
                          </p>
                        </div>

                        <div>
                          <label className="mb-1.5 block text-sm font-medium text-text-heading">
                            Notes
                          </label>

                          <textarea
                            value={notes}
                            onChange={(e) =>
                              setNotes(e.target.value)
                            }
                            rows={4}
                            placeholder="Additional treatment notes..."
                            className="w-full resize-none rounded-lg border border-border-default bg-white px-3 py-2.5 text-sm outline-none focus:border-brand-primary"
                          />
                        </div>

                        {error && (
                          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                            {error}
                          </div>
                        )}

                        <div className="flex justify-end gap-3">
                          <button
                            type="button"
                            onClick={() => {
                              resetForm();
                              setShowForm(false);
                            }}
                            className="rounded-lg border border-border-default bg-white px-4 py-2.5 text-sm font-medium text-text-heading hover:bg-neutral-50"
                          >
                            Cancel
                          </button>

                          <button
                            type="submit"
                            disabled={saving}
                            className="rounded-lg bg-brand-primary px-4 py-2.5 text-sm font-medium text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {saving
                              ? "Saving..."
                              : "Create Treatment Plan"}
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  {loading ? (
                    <div className="rounded-xl border border-border-default px-4 py-10 text-center text-sm text-text-muted">
                      Loading treatment plans...
                    </div>
                  ) : (
                    <DataTable
                      columns={planColumns}
                      data={planRows}
                      emptyMessage="No treatment plans found"
                    />
                  )}
                </div>
              )
            },
            {
              id: "notes",
              label: "Clinical Notes",
              content: (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-semibold text-text-heading">
                        Clinical Notes
                      </h3>

                      <p className="mt-1 text-sm text-text-muted">
                        Patient examination notes and clinical history.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => router.push("/admin/clinical/notes/new")}
                      className="inline-flex items-center gap-2 rounded-md bg-brand-primary px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-brand-primary-hover"
                    >
                      <Plus size={16} strokeWidth={2} />
                      Add Note
                    </button>
                  </div>

                  {notesLoading ? (
                    <div className="rounded-xl border border-border-default px-4 py-10 text-center text-sm text-text-muted">
                      Loading clinical notes...
                    </div>
                  ) : (
                    <DataTable
                      columns={noteColumns}
                      data={noteRows}
                      emptyMessage="No clinical notes found"
                    />
                  )}
                </div>
              )
            },
            {
              id: "prescriptions",
              label: "Prescriptions",
              content: (
                <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border-default bg-bg-page/50 py-16 text-center">
                  <svg
                    className="mb-3 text-text-muted"
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="7" cy="7" r="5" />
                    <circle cx="17" cy="17" r="5" />
                    <path d="M12 17h10" />
                    <path d="m3.46 10.54 7.08-7.08" />
                  </svg>

                  <h4 className="text-sm font-semibold text-text-heading">
                    No Prescriptions
                  </h4>

                  <p className="mt-1 max-w-sm text-sm text-text-muted">
                    Written prescriptions will be listed here.
                  </p>
                </div>
              )
            },
            {
              id: "documents",
              label: "Documents & Imaging",
              content: (
                <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border-default bg-bg-page/50 py-16 text-center">
                  <svg
                    className="mb-3 text-text-muted"
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect
                      x="3"
                      y="3"
                      width="18"
                      height="18"
                      rx="2"
                    />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>

                  <h4 className="text-sm font-semibold text-text-heading">
                    Imaging Repository
                  </h4>

                  <p className="mt-1 mb-4 max-w-sm text-sm text-text-muted">
                    Upload X-Rays and scanned documents.
                  </p>

                  <button className="rounded-md border border-border-default bg-white px-3 py-1.5 text-sm font-medium text-text-heading shadow-sm">
                    Upload File
                  </button>
                </div>
              )
            }
          ]}
        />
      </div>
    </div>
  );
}
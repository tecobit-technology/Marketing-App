"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import PageHeader from "@/components/admin/shared/PageHeader";
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

export default function TreatmentPlanDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const [plan, setPlan] = useState<TreatmentPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [error, setError] = useState("");

  const planId = params.id as string;

  const fetchPlan = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `/api/treatment-plans/${planId}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to fetch treatment plan"
        );
      }

      setPlan(data);
    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error
          ? error.message
          : "Failed to load treatment plan."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (planId) {
      fetchPlan();
    }
  }, [planId]);

  const handleMarkCompleted = async () => {
    if (!plan) return;

    const confirmed = window.confirm(
      "Are you sure you want to mark this treatment plan as completed?"
    );

    if (!confirmed) return;

    try {
      setCompleting(true);
      setError("");

      const response = await fetch(
        `/api/treatment-plans/${plan._id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: "completed",
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to complete treatment plan"
        );
      }

      setPlan(data);
    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error
          ? error.message
          : "Failed to complete treatment plan."
      );
    } finally {
      setCompleting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Treatment Plan"
          description="View treatment plan details."
        />

        <div className="rounded-xl border border-border-default bg-white px-4 py-12 text-center text-sm text-text-muted shadow-sm">
          Loading treatment plan...
        </div>
      </div>
    );
  }

  if (error || !plan) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Treatment Plan"
          description="View treatment plan details."
        />

        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-6 text-center">
          <p className="text-sm text-red-600">
            {error || "Treatment plan not found."}
          </p>

          <button
            type="button"
            onClick={() => router.back()}
            className="mt-4 rounded-lg border border-border-default bg-white px-4 py-2 text-sm font-medium text-text-heading hover:bg-neutral-50"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const totalCost = plan.items.reduce(
    (total, item) => total + (item.cost || 0),
    0
  );

  const formattedStatus =
    plan.status === "in-progress"
      ? "In Progress"
      : plan.status.charAt(0).toUpperCase() +
        plan.status.slice(1);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Treatment Plan Details"
        description="View patient treatment plan and completion status."
      />

      {/* Back button */}
      <button
        type="button"
        onClick={() => router.back()}
        className="text-sm font-medium text-text-muted hover:text-text-heading"
      >
        ← Back to Treatment Plans
      </button>

      {/* Main information */}
      <div className="rounded-xl border border-border-default bg-white shadow-sm">
        <div className="border-b border-border-default px-6 py-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-text-muted">
                Treatment Plan
              </p>

              <h2 className="mt-1 text-xl font-semibold text-text-heading">
                {plan.title}
              </h2>

              <p className="mt-1 text-sm text-text-muted">
                Plan ID: {plan._id.slice(-6).toUpperCase()}
              </p>
            </div>

            <StatusBadge status={formattedStatus} />
          </div>
        </div>

        {/* Patient information */}
        <div className="grid grid-cols-1 gap-6 border-b border-border-default px-6 py-6 md:grid-cols-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-text-muted">
              Patient
            </p>

            <p className="mt-1 text-sm font-semibold text-text-heading">
              {plan.patientId?.fullName || "Unknown Patient"}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-text-muted">
              Phone
            </p>

            <p className="mt-1 text-sm text-text-body">
              {plan.patientId?.phone || "Not provided"}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-text-muted">
              Date Created
            </p>

            <p className="mt-1 text-sm text-text-body">
              {new Date(plan.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Procedures */}
        <div className="px-6 py-6">
          <h3 className="text-base font-semibold text-text-heading">
            Treatment Procedures
          </h3>

          <div className="mt-4 overflow-hidden rounded-lg border border-border-default">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border-default bg-neutral-50">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-text-muted">
                    Procedure
                  </th>

                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-text-muted">
                    Priority
                  </th>

                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-text-muted">
                    Cost
                  </th>
                </tr>
              </thead>

              <tbody>
                {plan.items.length === 0 ? (
                  <tr>
                    <td
                      colSpan={3}
                      className="px-4 py-8 text-center text-sm text-text-muted"
                    >
                      No procedures added.
                    </td>
                  </tr>
                ) : (
                  plan.items.map((item, index) => (
                    <tr
                      key={index}
                      className="border-b border-border-default last:border-0"
                    >
                      <td className="px-4 py-3 text-sm text-text-body">
                        {item.procedure}
                      </td>

                      <td className="px-4 py-3 text-sm text-text-body">
                        {item.priority}
                      </td>

                      <td className="px-4 py-3 text-right text-sm font-medium text-text-heading">
                        Rs. {item.cost.toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>

              <tfoot>
                <tr className="bg-neutral-50">
                  <td
                    colSpan={2}
                    className="px-4 py-3 text-right text-sm font-semibold text-text-heading"
                  >
                    Total
                  </td>

                  <td className="px-4 py-3 text-right text-sm font-bold text-text-heading">
                    Rs. {totalCost.toLocaleString()}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Notes */}
        <div className="border-t border-border-default px-6 py-6">
          <h3 className="text-base font-semibold text-text-heading">
            Notes
          </h3>

          <div className="mt-3 rounded-lg bg-neutral-50 p-4">
            <p className="whitespace-pre-wrap text-sm leading-6 text-text-body">
              {plan.notes || "No notes added."}
            </p>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mx-6 mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-3 border-t border-border-default px-6 py-5 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-lg border border-border-default bg-white px-4 py-2.5 text-sm font-medium text-text-heading hover:bg-neutral-50"
          >
            Back
          </button>

          {plan.status === "in-progress" && (
            <button
              type="button"
              onClick={handleMarkCompleted}
              disabled={completing}
              className="rounded-lg bg-brand-primary px-4 py-2.5 text-sm font-medium text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {completing
                ? "Completing..."
                : "Mark as Completed"}
            </button>
          )}

          {plan.status === "completed" && (
            <div className="rounded-lg bg-green-50 px-4 py-2.5 text-sm font-medium text-green-700">
              Treatment Plan Completed
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
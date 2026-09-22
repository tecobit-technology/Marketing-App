"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CalendarCheck,
  Check,
  CircleUserRound,
  DoorOpen,
  Loader2,
  LogIn,
  X,
} from "lucide-react";

import PageHeader from "@/components/admin/shared/PageHeader";
import StatusBadge from "@/components/admin/shared/StatusBadge";

type Patient = {
  _id: string;
  fullName: string;
  phone?: string;
  email?: string;
};

type Dentist = {
  _id: string;
  name?: string;
  email?: string;
  role?: string;
};

type Appointment = {
  _id: string;
  patientId: Patient;
  dentistId?: Dentist | null;
  clinicId: string;
  dateTime: string;
  status: string;
  notes?: string;
};

function formatTime(date: Date) {
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function formatDate(date: Date) {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getStatusLabel(status: string) {
  switch (status) {
    case "scheduled":
      return "Scheduled";

    case "checked-in":
      return "Checked In";

    case "in-room":
      return "In Room";

    case "completed":
      return "Completed";

    case "cancelled":
      return "Cancelled";

    case "no-show":
      return "No Show";

    default:
      return status;
  }
}

function getDuration(
  currentAppointment: Appointment,
  nextAppointment?: Appointment,
) {
  if (!nextAppointment) {
    return "—";
  }

  const currentTime = new Date(
    currentAppointment.dateTime,
  ).getTime();

  const nextTime = new Date(
    nextAppointment.dateTime,
  ).getTime();

  const differenceInMinutes = Math.round(
    (nextTime - currentTime) / (1000 * 60),
  );

  if (differenceInMinutes <= 0) {
    return "—";
  }

  return `${differenceInMinutes}m`;
}

export default function SchedulePage() {
  const router = useRouter();

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Keeps track of which appointment is currently being updated.
  const [updatingAppointmentId, setUpdatingAppointmentId] =
    useState<string | null>(null);

  async function fetchAppointments() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/appointments");

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error || "Failed to fetch appointments",
        );
      }

      setAppointments(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Schedule appointments error:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Failed to fetch appointments",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchAppointments();
  }, []);

  /*
   * Update appointment status.
   *
   * This connects the Schedule UI to:
   *
   * PATCH /api/appointments/[id]
   */
  async function updateAppointmentStatus(
    appointmentId: string,
    status:
      | "checked-in"
      | "in-room"
      | "completed"
      | "cancelled"
      | "no-show",
  ) {
    try {
      setUpdatingAppointmentId(appointmentId);
      setError("");

      const response = await fetch(
        `/api/appointments/${appointmentId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error || "Failed to update appointment",
        );
      }

      // Refresh Schedule with the new status.
      await fetchAppointments();
    } catch (error) {
      console.error(
        "Update appointment status error:",
        error,
      );

      setError(
        error instanceof Error
          ? error.message
          : "Failed to update appointment",
      );
    } finally {
      setUpdatingAppointmentId(null);
    }
  }

  function goToPreviousDay() {
    setSelectedDate((current) => {
      const date = new Date(current);
      date.setDate(date.getDate() - 1);
      return date;
    });
  }

  function goToNextDay() {
    setSelectedDate((current) => {
      const date = new Date(current);
      date.setDate(date.getDate() + 1);
      return date;
    });
  }

  function goToToday() {
    setSelectedDate(new Date());
  }

  const filteredAppointments = useMemo(() => {
    const selectedYear = selectedDate.getFullYear();
    const selectedMonth = selectedDate.getMonth();
    const selectedDay = selectedDate.getDate();

    return appointments
      .filter((appointment) => {
        const appointmentDate = new Date(
          appointment.dateTime,
        );

        return (
          appointmentDate.getFullYear() === selectedYear &&
          appointmentDate.getMonth() === selectedMonth &&
          appointmentDate.getDate() === selectedDay
        );
      })
      .sort(
        (a, b) =>
          new Date(a.dateTime).getTime() -
          new Date(b.dateTime).getTime(),
      );
  }, [appointments, selectedDate]);

  return (
    <div className="space-y-6 flex flex-col h-[calc(100vh-8rem)]">
      <PageHeader
        title="Schedule"
        description="Manage appointments and calendar views."
        action={{
          label: "New Appointment",
          onClick: () => router.push("/appointments/new"),
        }}
      />

      <div className="flex-1 rounded-xl border border-border-default bg-white shadow-sm flex flex-col overflow-hidden">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border-default p-4 gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={goToPreviousDay}
              className="text-text-muted hover:text-text-heading p-1"
              aria-label="Previous day"
            >
              <ArrowLeft size={20} />
            </button>

            <h3 className="text-lg font-semibold text-text-heading px-2">
              {formatDate(selectedDate)}
            </h3>

            <button
              type="button"
              onClick={goToNextDay}
              className="text-text-muted hover:text-text-heading p-1"
              aria-label="Next day"
            >
              <ArrowRight size={20} />
            </button>

            <button
              type="button"
              onClick={goToToday}
              className="ml-2 rounded-md border border-border-default px-3 py-1.5 text-sm text-text-body hover:bg-gray-50"
            >
              Today
            </button>
          </div>

          <div className="flex gap-2">
            <select
              defaultValue="day"
              className="rounded-md border border-border-default px-3 py-1.5 text-sm bg-white focus:outline-none focus:border-brand-primary"
            >
              <option value="day">Day View</option>
              <option value="week">Week View</option>
            </select>
          </div>
        </div>

        {/* Schedule List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <p className="text-sm text-text-muted">
                Loading appointments...
              </p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <p className="text-sm text-red-600">{error}</p>

              <button
                type="button"
                onClick={fetchAppointments}
                className="rounded-md bg-brand-primary px-4 py-2 text-sm font-medium text-white hover:opacity-90"
              >
                Try Again
              </button>
            </div>
          ) : filteredAppointments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <CalendarCheck
                size={36}
                className="text-text-muted mb-3"
              />

              <p className="text-sm font-medium text-text-heading">
                No appointments
              </p>

              <p className="text-sm text-text-muted mt-1">
                There are no appointments scheduled for this day.
              </p>
            </div>
          ) : (
            filteredAppointments.map((appointment, index) => {
              const appointmentDate = new Date(
                appointment.dateTime,
              );

              const nextAppointment =
                filteredAppointments[index + 1];

              const patientName =
                appointment.patientId?.fullName ||
                "Unknown Patient";

              const dentistName =
                appointment.dentistId?.name ||
                "Not Assigned";

              const isUpdating =
                updatingAppointmentId === appointment._id;

              return (
                <div
                  key={appointment._id}
                  className="border border-border-default rounded-lg p-4 hover:border-brand-primary transition-colors group"
                >
                  <div className="flex flex-col lg:flex-row gap-4">
                    {/* Time */}
                    <div className="lg:w-24 shrink-0 border-b lg:border-b-0 lg:border-r border-border-default pb-3 lg:pb-0 lg:pr-4 flex flex-col justify-center">
                      <span className="text-lg font-bold text-text-heading">
                        {formatTime(appointmentDate)}
                      </span>

                      <span className="text-xs text-text-muted">
                        {getDuration(
                          appointment,
                          nextAppointment,
                        )}
                      </span>
                    </div>

                    {/* Appointment Details */}
                    <div className="flex-1">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
                        {/* Patient */}
                        <div>
                          <p className="text-sm font-semibold text-brand-primary">
                            {patientName}
                          </p>

                          <p className="text-xs text-text-muted mt-1">
                            {appointment.notes ||
                              "Appointment"}
                          </p>
                        </div>

                        {/* Dentist */}
                        <div>
                          <p className="text-sm text-text-body flex items-center gap-2">
                            <CircleUserRound
                              size={14}
                              className="text-text-muted"
                            />

                            {dentistName}
                          </p>
                        </div>

                        {/* Status */}
                        <div className="flex sm:justify-end">
                          <StatusBadge
                            status={getStatusLabel(
                              appointment.status,
                            )}
                          />
                        </div>
                      </div>

                      {/* Appointment Actions */}
                      <div className="mt-4 pt-3 border-t border-border-default flex flex-wrap items-center gap-2">
                        {/* Scheduled → Checked In */}
                        {appointment.status ===
                          "scheduled" && (
                          <>
                            <button
                              type="button"
                              disabled={isUpdating}
                              onClick={() =>
                                updateAppointmentStatus(
                                  appointment._id,
                                  "checked-in",
                                )
                              }
                              className="inline-flex items-center gap-2 rounded-md bg-brand-primary px-3 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                              {isUpdating ? (
                                <Loader2
                                  size={15}
                                  className="animate-spin"
                                />
                              ) : (
                                <LogIn size={15} />
                              )}

                              Check In
                            </button>

                            <button
                              type="button"
                              disabled={isUpdating}
                              onClick={() =>
                                updateAppointmentStatus(
                                  appointment._id,
                                  "cancelled",
                                )
                              }
                              className="inline-flex items-center gap-2 rounded-md border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                              <X size={15} />
                              Cancel
                            </button>

                            <button
                              type="button"
                              disabled={isUpdating}
                              onClick={() =>
                                updateAppointmentStatus(
                                  appointment._id,
                                  "no-show",
                                )
                              }
                              className="inline-flex items-center gap-2 rounded-md border border-border-default px-3 py-2 text-sm font-medium text-text-body hover:bg-gray-50 disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                              No Show
                            </button>
                          </>
                        )}

                        {/* Checked In → In Room */}
                        {appointment.status ===
                          "checked-in" && (
                          <button
                            type="button"
                            disabled={isUpdating}
                            onClick={() =>
                              updateAppointmentStatus(
                                appointment._id,
                                "in-room",
                              )
                            }
                            className="inline-flex items-center gap-2 rounded-md bg-brand-primary px-3 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
                          >
                            {isUpdating ? (
                              <Loader2
                                size={15}
                                className="animate-spin"
                              />
                            ) : (
                              <DoorOpen size={15} />
                            )}

                            Move to Room
                          </button>
                        )}

                        {/* In Room → Completed */}
                        {appointment.status === "in-room" && (
                          <button
                            type="button"
                            disabled={isUpdating}
                            onClick={() =>
                              updateAppointmentStatus(
                                appointment._id,
                                "completed",
                              )
                            }
                            className="inline-flex items-center gap-2 rounded-md bg-brand-primary px-3 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
                          >
                            {isUpdating ? (
                              <Loader2
                                size={15}
                                className="animate-spin"
                              />
                            ) : (
                              <Check size={15} />
                            )}

                            Complete
                          </button>
                        )}

                        {/* Completed */}
                        {appointment.status === "completed" && (
                          <div className="inline-flex items-center gap-2 text-sm font-medium text-green-600">
                            <Check size={16} />
                            Appointment Completed
                          </div>
                        )}

                        {/* Cancelled */}
                        {appointment.status === "cancelled" && (
                          <div className="text-sm font-medium text-red-600">
                            Appointment Cancelled
                          </div>
                        )}

                        {/* No Show */}
                        {appointment.status === "no-show" && (
                          <div className="text-sm font-medium text-text-muted">
                            Patient marked as No Show
                          </div>
                        )}
                      </div>

                      {/* Progress */}
                      {(appointment.status === "scheduled" ||
                        appointment.status === "checked-in" ||
                        appointment.status === "in-room" ||
                        appointment.status === "completed") && (
                        <div className="mt-4 flex items-center gap-2 text-xs">
                          <div
                            className={
                              appointment.status ===
                                "scheduled" ||
                              appointment.status ===
                                "checked-in" ||
                              appointment.status ===
                                "in-room" ||
                              appointment.status ===
                                "completed"
                                ? "font-medium text-brand-primary"
                                : "text-text-muted"
                            }
                          >
                            Scheduled
                          </div>

                          <span className="text-text-muted">
                            →
                          </span>

                          <div
                            className={
                              appointment.status ===
                                "checked-in" ||
                              appointment.status ===
                                "in-room" ||
                              appointment.status ===
                                "completed"
                                ? "font-medium text-brand-primary"
                                : "text-text-muted"
                            }
                          >
                            Checked In
                          </div>

                          <span className="text-text-muted">
                            →
                          </span>

                          <div
                            className={
                              appointment.status ===
                                "in-room" ||
                              appointment.status ===
                                "completed"
                                ? "font-medium text-brand-primary"
                                : "text-text-muted"
                            }
                          >
                            In Room
                          </div>

                          <span className="text-text-muted">
                            →
                          </span>

                          <div
                            className={
                              appointment.status ===
                              "completed"
                                ? "font-medium text-green-600"
                                : "text-text-muted"
                            }
                          >
                            Completed
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}


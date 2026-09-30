"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  CalendarPlus,
  Users,
  CalendarDays,
  Clock3,
  Stethoscope,
} from "lucide-react";
import StatCard from "@/components/admin/dashboard/StatCard";
import ScheduleList, {
  ScheduleItem,
} from "@/components/admin/dashboard/ScheduleList";

interface DashboardStats {
  totalPatients: number;
  todayAppointments: number;
  waitingQueue: number;
  clinicalEncounters: number;
}

interface DashboardData {
  stats: DashboardStats;
  todaySchedule: ScheduleItem[];
  upcomingAppointments: ScheduleItem[];
}

export default function AdminDashboardPage() {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await fetch("/api/admin/dashboard");

        if (response.status === 401) {
          window.location.href = "/login";
          return;
        }

        if (!response.ok) {
          throw new Error("Failed to fetch dashboard data");
        }

        const data = await response.json();
        setDashboard(data);
      } catch (error) {
        console.error("Dashboard fetch error:", error);
        setError("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const dateString = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-sm text-text-muted">Loading dashboard...</p>
      </div>
    );
  }

  if (error || !dashboard) {
    return (
      <div className="rounded-xl border border-error-100 bg-error-50 p-5">
        <p className="text-sm font-medium text-error-500">
          {error || "Failed to load dashboard."}
        </p>
      </div>
    );
  }

  const stats = [
    {
      label: "Total Patients",
      value: dashboard.stats.totalPatients.toString(),
      icon: <Users size={20} strokeWidth={2} />,
    },
    {
      label: "Today's Appointments",
      value: dashboard.stats.todayAppointments.toString(),
      icon: <CalendarDays size={20} strokeWidth={2} />,
    },
    {
      label: "Waiting Queue",
      value: dashboard.stats.waitingQueue.toString(),
      icon: <Clock3 size={20} strokeWidth={2} />,
    },
    {
      label: "Clinical Encounters",
      value: dashboard.stats.clinicalEncounters.toString(),
      icon: <Stethoscope size={20} strokeWidth={2} />,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-text-heading">
            Good morning 👋
          </h2>

          <p className="mt-1 text-sm text-text-muted">
            {dateString} · {dashboard.stats.todayAppointments} appointments
            today
          </p>
        </div>

        <Link
          href="/appointments/new"
          className="flex items-center gap-2 rounded-md bg-brand-primary px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-brand-primary-hover"
        >
          <CalendarPlus size={16} strokeWidth={2} />
          New Appointment
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <StatCard
            key={stat.label}
            label={stat.label}
            value={stat.value}
            icon={stat.icon}
          />
        ))}
      </div>

      {/* Schedule */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <ScheduleList
            title="Today's Schedule"
            items={dashboard.todaySchedule}
          />

          <ScheduleList
            title="Upcoming Appointments"
            items={dashboard.upcomingAppointments}
          />
        </div>

        {/* Dashboard summary */}
        <div className="rounded-xl border border-border-default bg-white p-5 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-text-heading">
            Today at a Glance
          </h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-muted">Total Patients</span>
              <span className="text-sm font-semibold text-text-heading">
                {dashboard.stats.totalPatients}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-text-muted">Appointments</span>
              <span className="text-sm font-semibold text-text-heading">
                {dashboard.stats.todayAppointments}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-text-muted">Waiting Queue</span>
              <span className="text-sm font-semibold text-text-heading">
                {dashboard.stats.waitingQueue}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-text-muted">
                Clinical Encounters
              </span>
              <span className="text-sm font-semibold text-text-heading">
                {dashboard.stats.clinicalEncounters}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

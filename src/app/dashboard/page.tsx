import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import type { ReactNode } from 'react';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db';
import {
  Appointment,
  Clinic,
  Encounter,
  Patient,
  QueueEntry,
} from '@/lib/models';

import SignOutButton from '@/components/SignOutButton/SignOutButton';
import GlobalSearch from '@/components/GlobalSearch/GlobalSearch';
import StatCard from '@/components/ui/StatCard';

import {
  CalendarIcon,
  ChartIcon,
  ClockIcon,
  UsersIcon,
} from '@/components/ui/icons';

export const metadata = {
  title: 'Dashboard — mysaas',
};

const statusStyles: Record<string, string> = {
  scheduled: 'bg-neutral-100 text-neutral-700',
  'checked-in': 'bg-blue-50 text-blue-600',
  'in-room': 'bg-orange-50 text-orange-600',
  completed: 'bg-green-50 text-green-600',
  cancelled: 'bg-red-50 text-red-600',
  'no-show': 'bg-red-50 text-red-600',
};

function SectionCard({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
      <h2 className="mb-5 text-base font-semibold text-neutral-900">
        {title}
      </h2>

      {children}
    </section>
  );
}

function ActionButton({
  href,
  children,
  primary = false,
}: {
  href: string;
  children: ReactNode;
  primary?: boolean;
}) {
  return (
    <Link
      href={href}
      className={[
        'rounded-xl px-4 py-2.5 text-sm font-medium transition',
        primary
          ? 'bg-[#0D8FA3] text-white hover:bg-[#087c8d]'
          : 'border border-neutral-200 bg-white text-neutral-800 hover:bg-neutral-50',
      ].join(' ')}
    >
      {children}
    </Link>
  );
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  if (session.user.role === 'patient') {
    redirect('/portal');
  }

  let clinicName = 'Your Clinic';

  let stats = {
    totalPatients: 0,
    todayAppointments: 0,
    waitingQueue: 0,
    encounters: 0,
  };

  let appointments: {
    _id: string;
    dateTime: Date;
    status: string;
    patientName: string;
  }[] = [];

  let recentPatients: {
    _id: string;
    fullName: string;
    email: string;
    insurance: string;
    createdAt: Date;
  }[] = [];

  let loadError = false;

  try {
    await connectToDatabase();

    const now = new Date();

    const startOfDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );

    const endOfDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 1
    );

    const clinicFilter = session.user.clinicId
      ? { clinicId: session.user.clinicId }
      : {};

    const [
      totalPatients,
      todayAppointments,
      waitingQueue,
      encounters,
      appointmentDocs,
      patientDocs,
      clinic,
    ] = await Promise.all([
      Patient.countDocuments(clinicFilter),

      Appointment.countDocuments({
        ...clinicFilter,
        dateTime: {
          $gte: startOfDay,
          $lt: endOfDay,
        },
      }),

      QueueEntry.countDocuments({
        ...clinicFilter,
        status: 'waiting',
      }),

      Encounter.countDocuments(clinicFilter),

      Appointment.find({
        ...clinicFilter,
        dateTime: { $gte: now },
        status: { $nin: ['cancelled', 'completed', 'no-show'] },
      })
        .sort({ dateTime: 1 })
        .limit(5)
        .lean(),

      Patient.find(clinicFilter)
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),

      session.user.clinicId
        ? Clinic.findById(session.user.clinicId).lean()
        : null,
    ]);

    const patientIds = appointmentDocs.map((appointment) => appointment.patientId);

    const patients = await Patient.find({
      _id: { $in: patientIds },
    })
      .select('fullName')
      .lean();

    const patientNames = new Map(
      patients.map((patient) => [
        patient._id.toString(),
        patient.fullName,
      ])
    );

    stats = {
      totalPatients,
      todayAppointments,
      waitingQueue,
      encounters,
    };

    appointments = appointmentDocs.map((appointment) => ({
      _id: appointment._id.toString(),
      dateTime: appointment.dateTime,
      status: appointment.status,
      patientName:
        patientNames.get(appointment.patientId.toString()) ??
        'Unknown patient',
    }));

    recentPatients = patientDocs.map((patient) => ({
      _id: patient._id.toString(),
      fullName: patient.fullName,
      email: patient.email,
      insurance: patient.insurance,
      createdAt: patient.createdAt,
    }));

    clinicName = clinic?.name ?? 'Your Clinic';
  } catch (error) {
    console.error('[dashboard] failed to load data:', error);
    loadError = true;
  }

  const hour = new Date().getHours();

  const greeting =
    hour < 12
      ? 'Good morning'
      : hour < 18
        ? 'Good afternoon'
        : 'Good evening';

  const firstName = session.user.name?.split(' ')[0] ?? 'there';

  const roleLabel = session.user.role
    ? session.user.role.charAt(0).toUpperCase() +
      session.user.role.slice(1)
    : '';

  return (
    <main className="min-h-screen bg-[#f7f9fb]">
      {/* Top Navigation */}
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-4">
          <div>
            <p className="text-lg font-bold text-neutral-900">
              mysaas
            </p>

            <p className="text-xs text-neutral-500">
              {clinicName}
              {roleLabel ? ` · ${roleLabel}` : ''}
            </p>
          </div>

          <div className="flex flex-1 justify-end gap-3">
            <GlobalSearch />

            <ActionButton href="/settings">
              Settings
            </ActionButton>

            <SignOutButton />
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Welcome Section */}
        <section
          className="
            mb-8 overflow-hidden rounded-3xl
            bg-gradient-to-r from-[#087d96] via-[#0d8fa3] to-[#f04e28]
            p-7 text-white shadow-lg
          "
        >
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
            <div>
              <p className="mb-2 text-sm text-white/80">
                {clinicName}
              </p>

              <h1 className="text-3xl font-bold tracking-tight">
                {greeting}, {firstName} 👋
              </h1>

              <p className="mt-2 text-sm text-white/80">
                Here&apos;s what&apos;s happening at your clinic today.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              {session.user.role === 'owner' && (
                <ActionButton href="/staff">
                  Staff
                </ActionButton>
              )}

              <ActionButton href="/patients">
                Manage patients
              </ActionButton>

              <Link
                href="/appointments/new"
                className="
                  rounded-xl bg-white px-4 py-2.5
                  text-sm font-semibold text-[#087d96]
                  transition hover:bg-white/90
                "
              >
                + New Appointment
              </Link>
            </div>
          </div>
        </section>

        {/* Error */}
        {loadError ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
            <p className="font-medium text-red-700">
              Could not load dashboard data.
            </p>

            <p className="mt-1 text-sm text-red-600">
              Make sure MongoDB is reachable, then refresh the page.
            </p>
          </div>
        ) : (
          <>
            {/* Statistics */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                label="Total Patients"
                value={stats.totalPatients}
                icon={<UsersIcon className="h-5 w-5" />}
              />

              <StatCard
                label="Today's Appointments"
                value={stats.todayAppointments}
                icon={<CalendarIcon className="h-5 w-5" />}
              />

              <StatCard
                label="Patients in Queue"
                value={stats.waitingQueue}
                icon={<ClockIcon className="h-5 w-5" />}
              />

              <StatCard
                label="Clinical Encounters"
                value={stats.encounters}
                icon={<ChartIcon className="h-5 w-5" />}
              />
            </div>

            {/* Main Content */}
            <div className="mt-7 grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* Appointments */}
              <SectionCard title="Upcoming Appointments">
                {appointments.length === 0 ? (
                  <div className="py-8 text-center">
                    <p className="text-sm text-neutral-500">
                      No upcoming appointments yet.
                    </p>

                    <Link
                      href="/appointments/new"
                      className="mt-3 inline-block text-sm font-medium text-[#087d96] hover:underline"
                    >
                      Create appointment →
                    </Link>
                  </div>
                ) : (
                  <ul className="divide-y divide-neutral-100">
                    {appointments.map((appointment) => {
                      const date = new Date(appointment.dateTime);

                      return (
                        <li
                          key={appointment._id}
                          className="flex items-center justify-between gap-4 py-4"
                        >
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-neutral-900">
                              {appointment.patientName}
                            </p>

                            <p className="mt-1 text-xs text-neutral-500">
                              {date.toLocaleDateString()} ·{' '}
                              {date.toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                          </div>

                          <span
                            className={`
                              shrink-0 rounded-full px-3 py-1
                              text-xs font-medium
                              ${
                                statusStyles[appointment.status] ??
                                'bg-neutral-100 text-neutral-600'
                              }
                            `}
                          >
                            {appointment.status}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                )}

                {appointments.length > 0 && (
                  <Link
                    href="/appointments"
                    className="
                      mt-4 block rounded-xl border border-neutral-200
                      py-2.5 text-center text-sm font-medium
                      text-[#087d96] hover:bg-neutral-50
                    "
                  >
                    View all appointments →
                  </Link>
                )}
              </SectionCard>

              {/* Recent Patients */}
              <SectionCard title="Recent Patients">
                {recentPatients.length === 0 ? (
                  <div className="py-8 text-center">
                    <p className="text-sm text-neutral-500">
                      No patients yet.
                    </p>

                    <Link
                      href="/patients/new"
                      className="mt-3 inline-block text-sm font-medium text-[#087d96] hover:underline"
                    >
                      Add patient →
                    </Link>
                  </div>
                ) : (
                  <ul className="divide-y divide-neutral-100">
                    {recentPatients.map((patient) => (
                      <li
                        key={patient._id}
                        className="flex items-center justify-between gap-4 py-4"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <div
                            className="
                              flex h-10 w-10 shrink-0 items-center
                              justify-center rounded-full
                              bg-[#e7f7f8] text-sm font-semibold
                              text-[#087d96]
                            "
                          >
                            {patient.fullName
                              .split(' ')
                              .map((name) => name[0])
                              .slice(0, 2)
                              .join('')}
                          </div>

                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-neutral-900">
                              {patient.fullName}
                            </p>

                            <p className="truncate text-xs text-neutral-500">
                              {patient.email || 'No email'}
                            </p>
                          </div>
                        </div>

                        <span className="shrink-0 text-xs text-neutral-500">
                          {patient.insurance || '—'}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}

                {recentPatients.length > 0 && (
                  <Link
                    href="/patients"
                    className="
                      mt-4 block rounded-xl border border-neutral-200
                      py-2.5 text-center text-sm font-medium
                      text-[#087d96] hover:bg-neutral-50
                    "
                  >
                    View all patients →
                  </Link>
                )}
              </SectionCard>
            </div>

            {/* Quick Actions */}
            <section className="mt-7">
              <h2 className="mb-4 text-base font-semibold text-neutral-900">
                Quick Actions
              </h2>

              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                <Link
                  href="/appointments/new"
                  className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <CalendarIcon className="h-6 w-6 text-[#087d96]" />

                  <p className="mt-3 text-sm font-semibold text-neutral-900">
                    New Appointment
                  </p>

                  <p className="mt-1 text-xs text-neutral-500">
                    Schedule a patient
                  </p>
                </Link>

                <Link
                  href="/patients/new"
                  className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <UsersIcon className="h-6 w-6 text-blue-600" />

                  <p className="mt-3 text-sm font-semibold text-neutral-900">
                    Add Patient
                  </p>

                  <p className="mt-1 text-xs text-neutral-500">
                    Register a patient
                  </p>
                </Link>

                <Link
                  href="/queue"
                  className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <ClockIcon className="h-6 w-6 text-orange-500" />

                  <p className="mt-3 text-sm font-semibold text-neutral-900">
                    View Queue
                  </p>

                  <p className="mt-1 text-xs text-neutral-500">
                    Manage waiting patients
                  </p>
                </Link>

                <Link
                  href="/encounters"
                  className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <ChartIcon className="h-6 w-6 text-purple-600" />

                  <p className="mt-3 text-sm font-semibold text-neutral-900">
                    Encounters
                  </p>

                  <p className="mt-1 text-xs text-neutral-500">
                    View clinical records
                  </p>
                </Link>
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}

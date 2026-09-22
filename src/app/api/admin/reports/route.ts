import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import {
  Appointment,
  Encounter,
  Patient,
  Payment,
  TreatmentPlan,
} from "@/lib/models";

type ReportPeriod = "this-month" | "last-month" | "this-year" | "custom";

type DateRange = {
  start: Date;
  end: Date;
  period: ReportPeriod;
};

interface AppointmentStatusSummary {
  name: string;
  value: number;
}

const DAY_IN_MS = 24 * 60 * 60 * 1000;

function normalizeDate(value: string | null) {
  if (!value) return null;

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return new Date(parsed.getTime());
}

function getDateRange(period: ReportPeriod, startDate?: string | null, endDate?: string | null): DateRange {
  const now = new Date();

  if (period === "this-month") {
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    return { start, end, period };
  }

  if (period === "last-month") {
    const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

    return { start, end, period };
  }

  if (period === "this-year") {
    const start = new Date(now.getFullYear(), 0, 1);
    const end = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);

    return { start, end, period };
  }

  const customStart = normalizeDate(startDate ?? null);
  const customEnd = normalizeDate(endDate ?? null);

  if (!customStart || !customEnd) {
    throw new Error("Custom date range requires both startDate and endDate.");
  }

  if (customStart.getTime() > customEnd.getTime()) {
    throw new Error("Start date must be earlier than or equal to the end date.");
  }

  const start = new Date(customStart.getFullYear(), customStart.getMonth(), customStart.getDate(), 0, 0, 0, 0);
  const end = new Date(customEnd.getFullYear(), customEnd.getMonth(), customEnd.getDate(), 23, 59, 59, 999);

  return { start, end, period };
}

function getTrendBucketLabel(date: Date, monthly: boolean) {
  if (monthly) {
    return date.toLocaleDateString("en-US", {
      month: "short",
      year: "2-digit",
    });
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function buildRevenueTrend(start: Date, end: Date, period: ReportPeriod, payments: Array<{ paymentDate: Date; amount: number }>) {
  const diffDays = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / DAY_IN_MS) + 1);
  const monthly = period === "this-year" || diffDays > 90;

  const buckets = new Map<string, { label: string; revenue: number }>();
  const cursor = new Date(start);
  cursor.setHours(0, 0, 0, 0);

  while (cursor <= end) {
    const key = monthly
      ? `${cursor.getFullYear()}-${cursor.getMonth()}`
      : `${cursor.getFullYear()}-${cursor.getMonth()}-${cursor.getDate()}`;

    if (!buckets.has(key)) {
      buckets.set(key, {
        label: getTrendBucketLabel(cursor, monthly),
        revenue: 0,
      });
    }

    const next = new Date(cursor);
    next.setDate(cursor.getDate() + 1);
    cursor.setTime(next.getTime());
  }

  for (const payment of payments) {
    const paymentDate = new Date(payment.paymentDate);
    const key = monthly
      ? `${paymentDate.getFullYear()}-${paymentDate.getMonth()}`
      : `${paymentDate.getFullYear()}-${paymentDate.getMonth()}-${paymentDate.getDate()}`;

    const bucket = buckets.get(key);

    if (bucket) {
      bucket.revenue += Number(payment.amount) || 0;
    }
  }

  return Array.from(buckets.values()).map((bucket) => ({
    label: bucket.label,
    revenue: Number(bucket.revenue.toFixed(2)),
  }));
}

function aggregateTreatmentCounts(entries: Array<{ title?: string; procedure?: string; description?: string; code?: string }>) {
  const counts = new Map<string, number>();

  for (const entry of entries) {
    const treatmentName = entry.title ?? entry.procedure ?? entry.description ?? entry.code;

    if (!treatmentName) {
      continue;
    }

    const normalized = treatmentName.trim();

    if (!normalized) {
      continue;
    }

    counts.set(normalized, (counts.get(normalized) ?? 0) + 1);
  }

  return Array.from(counts.entries())
    .map(([treatment, count]) => ({ treatment, count }))
    .sort((a, b) => b.count - a.count);
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const clinicId = session.user.clinicId;

    if (!clinicId) {
      return NextResponse.json(
        { message: "Clinic ID not found in session" },
        { status: 400 },
      );
    }

    const periodParam = request.nextUrl.searchParams.get("period") ?? "this-month";
    const startDate = request.nextUrl.searchParams.get("startDate");
    const endDate = request.nextUrl.searchParams.get("endDate");
    const period: ReportPeriod =
      periodParam === "this-month" ||
      periodParam === "last-month" ||
      periodParam === "this-year" ||
      periodParam === "custom"
        ? periodParam
        : "this-month";

    const range = getDateRange(period, startDate, endDate);

    await connectToDatabase();

    const [
      totalPatients,
      newPatients,
      completedAppointments,
      totalAppointments,
      cancelledAppointments,
      revenueResult,
      patientIds,
      appointmentStatusBreakdown,
    ] = await Promise.all([
      Patient.countDocuments({ clinicId }),
      Patient.countDocuments({
        clinicId,
        createdAt: {
          $gte: range.start,
          $lte: range.end,
        },
      }),
      Appointment.countDocuments({
        clinicId,
        status: "completed",
        dateTime: {
          $gte: range.start,
          $lte: range.end,
        },
      }),
      Appointment.countDocuments({
        clinicId,
        dateTime: {
          $gte: range.start,
          $lte: range.end,
        },
      }),
      Appointment.countDocuments({
        clinicId,
        status: { $in: ["cancelled", "no-show"] },
        dateTime: {
          $gte: range.start,
          $lte: range.end,
        },
      }),
      Payment.aggregate([
        {
          $match: {
            clinicId,
            paymentDate: {
              $gte: range.start,
              $lte: range.end,
            },
          },
        },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: "$amount" },
          },
        },
      ]),
      Patient.find({ clinicId }).select("_id").lean(),
      Appointment.aggregate([
        {
          $match: {
            clinicId,
            dateTime: {
              $gte: range.start,
              $lte: range.end,
            },
          },
        },
        {
          $group: {
            _id: "$status",
            total: { $sum: 1 },
          },
        },
      ]),
    ]);

    const revenueTotal = revenueResult[0]?.totalRevenue ?? 0;
    const cancellationRate = totalAppointments > 0 ? (cancelledAppointments / totalAppointments) * 100 : 0;

    const payments = await Payment.find({
      clinicId,
      paymentDate: {
        $gte: range.start,
        $lte: range.end,
      },
    })
      .select("paymentDate amount")
      .lean();

    const revenueTrend = buildRevenueTrend(
      range.start,
      range.end,
      range.period,
      payments.map((payment) => ({
        paymentDate: payment.paymentDate,
        amount: Number(payment.amount ?? 0),
      })),
    );

    const statusMap: Record<string, number> = {
      completed: 0,
      scheduled: 0,
      cancelled: 0,
      "no-show": 0,
    };

    for (const entry of appointmentStatusBreakdown) {
      const status = entry._id as string;
      const total = Number(entry.total) || 0;

      if (status === "completed") {
        statusMap.completed = total;
      } else if (status === "scheduled") {
        statusMap.scheduled = total;
      } else if (status === "cancelled") {
        statusMap.cancelled = total;
      } else if (status === "no-show") {
        statusMap["no-show"] = total;
      }
    }

    const appointmentStatusData: AppointmentStatusSummary[] = [
      { name: "Completed", value: statusMap.completed },
      { name: "Scheduled", value: statusMap.scheduled },
      { name: "Cancelled", value: statusMap.cancelled },
      { name: "No Show", value: statusMap["no-show"] },
    ];

    const patientIdList = patientIds.map((patient) => patient._id);

    const [treatmentPlans, encounters] = await Promise.all([
      TreatmentPlan.find({
        clinicId,
        createdAt: {
          $gte: range.start,
          $lte: range.end,
        },
      })
        .select("items")
        .lean(),
      Encounter.find({
        patientId: { $in: patientIdList },
        createdAt: {
          $gte: range.start,
          $lte: range.end,
        },
      })
        .select("procedures")
        .lean(),
    ]);

    const treatmentEntries = [
      ...treatmentPlans.flatMap((plan) => plan.items ?? []),
      ...encounters.flatMap((encounter) => encounter.procedures ?? []),
    ];

    const appointmentsByTreatment = aggregateTreatmentCounts(treatmentEntries)
      .filter((entry) => entry.count > 0)
      .slice(0, 8);

    return NextResponse.json({
      summary: {
        totalPatients,
        newPatients,
        completedAppointments,
        totalRevenue: Number(revenueTotal.toFixed(2)),
        cancellationRate: Number(cancellationRate.toFixed(2)),
      },
      revenueTrend,
      appointmentStatusBreakdown: appointmentStatusData,
      appointmentsByTreatment,
    });
  } catch (error) {
    console.error("Reports API error:", error);

    const message = error instanceof Error ? error.message : "Failed to load reports data";

    return NextResponse.json(
      { message },
      {
        status: message.includes("date") || message.includes("session") ? 400 : 500,
      },
    );
  }
}

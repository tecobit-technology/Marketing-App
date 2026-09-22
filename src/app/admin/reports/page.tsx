"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CalendarCheck2,
  CalendarDays,
  CalendarX2,
  CircleDollarSign,
  Download,
  FileBarChart,
  Loader2,
  Stethoscope,
  TrendingUp,
  Users,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import PageHeader from "@/components/admin/shared/PageHeader";
import StatCard from "@/components/admin/dashboard/StatCard";

type ReportPeriod = "this-month" | "last-month" | "this-year" | "custom";

interface ReportSummary {
  totalPatients: number;
  newPatients: number;
  completedAppointments: number;
  totalRevenue: number;
  cancellationRate: number;
}

interface RevenueTrendPoint {
  label: string;
  revenue: number;
}

interface TreatmentBreakdownItem {
  treatment: string;
  count: number;
}

// ADD THIS HERE
interface AppointmentStatusItem {
  name: string;
  value: number;
}

interface ReportsApiResponse {
  summary: ReportSummary;
  revenueTrend: RevenueTrendPoint[];

  // ADD THIS
  appointmentStatusBreakdown: AppointmentStatusItem[];

  appointmentsByTreatment: TreatmentBreakdownItem[];
}

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const compactCurrencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  notation: "compact",
  maximumFractionDigits: 1,
});

const chartColors = [
  "#0D8FA3",
  "#2B6CB0",
  "#F59E0B",
  "#10B981",
  "#8B5CF6",
  "#EF4444",
  "#14B8A6",
  "#FB7185",
];

function formatISODate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export default function ReportsPage() {
  const [rangeKey, setRangeKey] = useState<ReportPeriod>("this-month");
  const [customStart, setCustomStart] = useState(() =>
    formatISODate(new Date(new Date().getFullYear(), new Date().getMonth(), 1)),
  );
  const [customEnd, setCustomEnd] = useState(() => formatISODate(new Date()));
  const [data, setData] = useState<ReportsApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  const rangeLabel = useMemo(() => {
    if (rangeKey === "this-month") return "This Month";
    if (rangeKey === "last-month") return "Last Month";
    if (rangeKey === "this-year") return "This Year";
    return `${customStart || "Start"} to ${customEnd || "End"}`;
  }, [customEnd, customStart, rangeKey]);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams({ period: rangeKey });

        if (rangeKey === "custom") {
          if (!customStart || !customEnd) {
            setData(null);
            setError("Please choose both a start and end date.");
            return;
          }

          params.set("startDate", customStart);
          params.set("endDate", customEnd);
        }

        const response = await fetch(`/api/admin/reports?${params.toString()}`);

        if (response.status === 401) {
          window.location.href = "/login";
          return;
        }

        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          throw new Error(errorData?.message || "Unable to load the report.");
        }

        const result = (await response.json()) as ReportsApiResponse;
        setData(result);
      } catch (loadError) {
        setData(null);
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Unable to load report data.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [customEnd, customStart, rangeKey]);

  const summaryCards = data
    ? [
        {
          label: "Total Patients",
          value: data.summary.totalPatients.toLocaleString(),
          icon: <Users className="h-4 w-4" />,
          trend: {
            value: `${data.summary.newPatients} new`,
            isPositive: data.summary.newPatients > 0,
          },
        },
        {
          label: "Completed Appointments",
          value: data.summary.completedAppointments.toLocaleString(),
          icon: <CalendarCheck2 className="h-4 w-4" />,
          trend: undefined,
        },
        {
          label: "Total Revenue",
          value: currencyFormatter.format(data.summary.totalRevenue),
          icon: <CircleDollarSign className="h-4 w-4" />,
          trend: undefined,
        },
        {
          label: "Cancellation Rate",
          value: `${data.summary.cancellationRate.toFixed(1)}%`,
          icon: <CalendarX2 className="h-4 w-4" />,
          trend: {
            value: data.summary.cancellationRate === 0 ? "0%" : "review",
            isPositive: data.summary.cancellationRate <= 5,
          },
        },
      ]
    : [];

  const exportReport = async () => {
    if (!data) {
      return;
    }

    setExporting(true);

    try {
      const rows: string[][] = [
        ["Date Range", rangeLabel],
        [""],
        ["Summary"],
        ["Metric", "Value"],
        ["Total Patients", String(data.summary.totalPatients)],
        ["New Patients", String(data.summary.newPatients)],
        ["Completed Appointments", String(data.summary.completedAppointments)],
        ["Total Revenue", String(data.summary.totalRevenue)],
        ["Cancellation Rate", `${data.summary.cancellationRate}%`],
        [""],
        ["Revenue Trend"],
        ["Label", "Revenue"],
        ...data.revenueTrend.map((point) => [
          point.label,
          String(point.revenue),
        ]),
        [""],
        ["Appointments By Treatment"],
        ["Treatment", "Count"],
        ...data.appointmentsByTreatment.map((item) => [
          item.treatment,
          String(item.count),
        ]),
      ];

      const csv = rows
        .map((row) =>
          row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","),
        )
        .join("\n");

      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = `reports-${rangeKey}-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  };

  const emptyRevenue = !data || data.revenueTrend.length === 0;
  const emptyTreatments = !data || data.appointmentsByTreatment.length === 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports & Analytics"
        description="Comprehensive insights into practice performance."
      />

      <div className="flex flex-col gap-4 rounded-xl border border-border-default bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
          <div className="flex items-center gap-2 text-sm font-medium text-text-heading">
            <CalendarDays className="h-4 w-4 text-brand-primary" />
            <span>Date Range:</span>
          </div>

          <select
            value={rangeKey}
            onChange={(event) =>
              setRangeKey(event.target.value as ReportPeriod)
            }
            className="rounded-md border border-border-default bg-white px-3 py-2 text-sm text-text-heading focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
          >
            <option value="this-month">This Month</option>
            <option value="last-month">Last Month</option>
            <option value="this-year">This Year</option>
            <option value="custom">Custom Range</option>
          </select>

          {rangeKey === "custom" && (
            <div className="flex flex-col gap-2 sm:flex-row">
              <label className="flex items-center gap-2 rounded-md border border-border-default bg-white px-3 py-2 text-sm text-text-heading">
                <CalendarDays className="h-4 w-4 text-brand-primary" />
                <input
                  type="date"
                  value={customStart}
                  onChange={(event) => setCustomStart(event.target.value)}
                  className="bg-transparent text-sm focus:outline-none"
                />
              </label>

              <label className="flex items-center gap-2 rounded-md border border-border-default bg-white px-3 py-2 text-sm text-text-heading">
                <CalendarDays className="h-4 w-4 text-brand-primary" />
                <input
                  type="date"
                  value={customEnd}
                  onChange={(event) => setCustomEnd(event.target.value)}
                  className="bg-transparent text-sm focus:outline-none"
                />
              </label>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={exportReport}
          disabled={exporting || !data}
          className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-border-default bg-white px-4 py-2 text-sm font-medium text-text-heading shadow-sm transition-colors hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        >
          {exporting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Exporting...</span>
            </>
          ) : (
            <>
              <Download className="h-4 w-4" />
              <span>Export Report</span>
            </>
          )}
        </button>
      </div>

      {loading && (
        <div className="flex min-h-[240px] items-center justify-center rounded-xl border border-border-default bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3 text-sm text-text-muted">
            <Loader2 className="h-5 w-5 animate-spin text-brand-primary" />
            <span>Loading report data...</span>
          </div>
        </div>
      )}

      {!loading && error && (
        <div className="rounded-xl border border-error-100 bg-error-50 p-5 shadow-sm">
          <div className="flex items-center gap-3 text-error-600">
            <AlertCircle className="h-5 w-5" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        </div>
      )}

      {!loading && !error && data && (
        <>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {summaryCards.map((card) => (
              <StatCard
                key={card.label}
                label={card.label}
                value={card.value}
                icon={card.icon}
                trend={card.trend}
              />
            ))}
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-xl border border-border-default bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-brand-primary" />
                <h3 className="text-lg font-semibold text-text-heading">
                  Revenue Trend
                </h3>
              </div>

              {emptyRevenue ? (
                <div className="flex h-64 items-center justify-center rounded-lg border border-dashed border-border-default bg-bg-page/40 text-center">
                  <div className="flex flex-col items-center gap-2 text-text-muted">
                    <FileBarChart className="h-8 w-8" />
                    <p className="text-sm">No revenue data for this range.</p>
                  </div>
                </div>
              ) : (
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={data.revenueTrend}
                      margin={{ top: 10, right: 12, left: -12, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient
                          id="revenueFill"
                          x1="0"
                          x2="0"
                          y1="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#0D8FA3"
                            stopOpacity={0.35}
                          />
                          <stop
                            offset="95%"
                            stopColor="#0D8FA3"
                            stopOpacity={0.05}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis
                        dataKey="label"
                        tickLine={false}
                        axisLine={false}
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis
                        tickLine={false}
                        axisLine={false}
                        tick={{ fontSize: 12 }}
                        tickFormatter={(value) =>
                          compactCurrencyFormatter.format(value)
                        }
                      />
                      <Tooltip
                        formatter={(value: number) => [
                          currencyFormatter.format(Number(value)),
                          "Revenue",
                        ]}
                        labelStyle={{ color: "#111827" }}
                      />
                      <Area
                        type="monotone"
                        dataKey="revenue"
                        stroke="#0D8FA3"
                        fill="url(#revenueFill)"
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            <div className="rounded-xl border border-border-default bg-white p-6 shadow-sm">
              <div className="mb-6 flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-primary/10">
                  <CalendarCheck2 className="h-5 w-5 text-brand-primary" />
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-text-heading">
                    Appointment Status
                  </h3>

                  <p className="text-sm text-text-muted">
                    Distribution of appointments by current status
                  </p>
                </div>
              </div>

              {data.appointmentStatusBreakdown.every(
                (item) => item.value === 0,
              ) ? (
                <div className="flex h-[300px] items-center justify-center rounded-lg border border-dashed border-border-default bg-bg-page/40">
                  <div className="text-center">
                    <CalendarDays className="mx-auto mb-2 h-8 w-8 text-text-muted" />

                    <p className="text-sm font-medium text-text-heading">
                      No appointment data
                    </p>

                    <p className="mt-1 text-xs text-text-muted">
                      There are no appointments for this period.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex min-h-[320px] flex-col items-center justify-center gap-8 lg:flex-row lg:gap-12">
                  {/* Donut */}
                  <div className="relative h-[240px] w-[240px] shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={data.appointmentStatusBreakdown.filter(
                            (item) => item.value > 0,
                          )}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={72}
                          outerRadius={105}
                          paddingAngle={3}
                          startAngle={90}
                          endAngle={-270}
                          stroke="white"
                          strokeWidth={2}
                          isAnimationActive={false}
                        >
                          {data.appointmentStatusBreakdown
                            .filter((item) => item.value > 0)
                            .map((entry, index) => (
                              <Cell
                                key={`${entry.name}-${index}`}
                                fill={chartColors[index % chartColors.length]}
                              />
                            ))}
                        </Pie>

                        <Tooltip
                          formatter={(value: number, name: string) => {
                            const total =
                              data.appointmentStatusBreakdown.reduce(
                                (sum, item) => sum + item.value,
                                0,
                              );

                            const percentage =
                              total > 0
                                ? ((value / total) * 100).toFixed(1)
                                : "0.0";

                            return [`${value} (${percentage}%)`, name];
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>

                    {/* Center */}
                    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <p className="text-3xl font-bold tracking-tight text-text-heading">
                          {data.appointmentStatusBreakdown.reduce(
                            (total, item) => total + item.value,
                            0,
                          )}
                        </p>

                        <p className="mt-1 text-xs font-medium text-text-muted">
                          Appointments
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Status Breakdown */}
                  <div className="w-full max-w-[280px] space-y-4">
                    {data.appointmentStatusBreakdown
                      .filter((item) => item.value > 0)
                      .map((item, index) => {
                        const total = data.appointmentStatusBreakdown.reduce(
                          (sum, status) => sum + status.value,
                          0,
                        );

                        const percentage =
                          total > 0 ? (item.value / total) * 100 : 0;

                        return (
                          <div
                            key={item.name}
                            className="flex items-center justify-between gap-4"
                          >
                            <div className="flex min-w-0 items-center gap-3">
                              <span
                                className="h-3 w-3 shrink-0 rounded-full"
                                style={{
                                  backgroundColor:
                                    chartColors[index % chartColors.length],
                                }}
                              />

                              <span className="truncate text-sm font-medium text-text-heading">
                                {item.name}
                              </span>
                            </div>

                            <div className="flex shrink-0 items-center gap-3">
                              <span className="text-sm font-semibold text-text-heading">
                                {item.value}
                              </span>

                              <span className="w-12 text-right text-xs text-text-muted">
                                {percentage.toFixed(1)}%
                              </span>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {!loading && !error && !data && (
        <div className="rounded-xl border border-border-default bg-white p-6 shadow-sm">
          <div className="flex items-center justify-center gap-3 text-sm text-text-muted">
            <FileBarChart className="h-5 w-5 text-brand-primary" />
            <span>No report data available for the selected range.</span>
          </div>
        </div>
      )}
    </div>
  );
}

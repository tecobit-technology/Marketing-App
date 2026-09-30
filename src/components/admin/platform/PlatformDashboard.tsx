"use client";

import DataTable, {
  type Column,
} from "@/components/admin/shared/DataTable";
import StatusBadge from "@/components/admin/shared/StatusBadge";

export interface PlatformTableItem {
  _id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  status: string;
  date: string;
  type?: string;
}

interface PlatformDashboardTableProps {
  data: PlatformTableItem[];
  emptyMessage?: string;
  type?: "demo" | "lead";
}

export default function PlatformDashboardTable({
  data,
  emptyMessage = "No data found",
  type = "demo",
}: PlatformDashboardTableProps) {
  const demoColumns: Column<PlatformTableItem>[] = [
    {
      key: "company",
      label: "Clinic",
    },
    {
      key: "name",
      label: "Contact",
    },
    {
      key: "email",
      label: "Email",
    },
    {
      key: "date",
      label: "Demo Date",
      render: (item) =>
        item.date
          ? new Date(item.date).toLocaleDateString()
          : "-",
    },
    {
      key: "status",
      label: "Status",
      render: (item) => (
        <StatusBadge status={item.status} />
      ),
    },
  ];

  const leadColumns: Column<PlatformTableItem>[] = [
    {
      key: "company",
      label: "Clinic",
    },
    {
      key: "name",
      label: "Contact",
    },
    {
      key: "email",
      label: "Email",
    },
    {
      key: "date",
      label: "Created",
      render: (item) =>
        item.date
          ? new Date(item.date).toLocaleDateString()
          : "-",
    },
    {
      key: "status",
      label: "Status",
      render: (item) => (
        <StatusBadge status={item.status} />
      ),
    },
  ];

  return (
    <DataTable
      columns={type === "demo" ? demoColumns : leadColumns}
      data={data}
      emptyMessage={emptyMessage}
    />
  );
}
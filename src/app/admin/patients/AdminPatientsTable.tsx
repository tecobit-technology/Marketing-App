"use client";

import React from "react";
import { useRouter } from "next/navigation";

import DataTable, {
  Column,
} from "@/components/admin/shared/DataTable";
import StatusBadge from "@/components/admin/shared/StatusBadge";

export type AdminPatient = {
  id: string;
  name: string;
  email: string;
  phone: string;
  lastVisit: string;
  status: string;
};

type Props = {
  patients: AdminPatient[];
};

export default function AdminPatientsTable({ patients }: Props) {
  const router = useRouter();

  const columns: Column<AdminPatient>[] = [
    {
      key: "id",
      label: "ID",
    },
    {
      key: "name",
      label: "Patient",
      render: (p) => (
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-tint text-brand-primary font-semibold text-xs">
            {p.name.charAt(0)}
          </div>

          <span className="font-medium text-text-heading">
            {p.name}
          </span>
        </div>
      ),
    },
    {
      key: "phone",
      label: "Phone",
    },
    {
      key: "lastVisit",
      label: "Last Visit",
    },
    {
      key: "status",
      label: "Status",
      render: (p) => (
        <StatusBadge
          status={p.status}
          variant={p.status === "Active" ? "success" : "neutral"}
        />
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={patients}
      onRowClick={(p) => router.push(`/admin/patients/${p.id}`)}
    />
  );
}
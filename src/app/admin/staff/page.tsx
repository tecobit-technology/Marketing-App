"use client";

import React, { useEffect, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import PageHeader from "@/components/admin/shared/PageHeader";
import DataTable, { Column } from "@/components/admin/shared/DataTable";
import StatusBadge from "@/components/admin/shared/StatusBadge";
import Tabs from "@/components/admin/shared/Tabs";

type StaffRole = "dentist" | "manager" | "receptionist";

interface StaffMember {
  _id: string;
  name: string;
  email: string;
  role: StaffRole;
  createdAt?: string;
}

interface StaffRow {
  _id: string;
  name: string;
  email: string;
  role: StaffRole;
  displayRole: string;
}

interface StaffFormState {
  name: string;
  email: string;
  role: StaffRole;
  password: string;
}

const EMPTY_FORM: StaffFormState = {
  name: "",
  email: "",
  role: "dentist",
  password: "",
};

const ROLE_LABEL: Record<StaffRole, string> = {
  dentist: "Dentist",
  manager: "Manager",
  receptionist: "Receptionist",
};

function toRow(member: StaffMember): StaffRow {
  return {
    _id: member._id,
    name: member.name,
    email: member.email,
    role: member.role,
    displayRole: ROLE_LABEL[member.role] ?? member.role,
  };
}

export default function StaffPage() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [deleteLoadingId, setDeleteLoadingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<StaffFormState>(EMPTY_FORM);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/staff");

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error ?? "Failed to fetch staff");
      }

      const data = (await response.json()) as StaffMember[];
      setStaff(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error ? err.message : "Failed to load staff.",
      );
      setStaff([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadStaff = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("/api/staff");

        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error(data.error ?? "Failed to fetch staff");
        }

        const data = (await response.json()) as StaffMember[];
        setStaff(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        setError(
          err instanceof Error ? err.message : "Failed to load staff.",
        );
        setStaff([]);
      } finally {
        setLoading(false);
      }
    };

    void loadStaff();
  }, []);

  const openCreateForm = () => {
    setEditingId(null);
    setFormData(EMPTY_FORM);
    setFormError("");
    setShowForm(true);
  };

  const openEditForm = (member: StaffMember) => {
    setEditingId(member._id);
    setFormData({
      name: member.name,
      email: member.email,
      role: member.role,
      password: "",
    });
    setFormError("");
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData(EMPTY_FORM);
    setFormError("");
  };

  const handleFieldChange = (
    field: keyof StaffFormState,
    value: string,
  ) => {
    setFormData((previous) => ({
      ...previous,
      [field]: field === "role" ? (value as StaffRole) : value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setFormError("");

    const name = formData.name.trim();
    const email = formData.email.trim();

    if (!name) {
      setFormError("Name is required.");
      return;
    }

    if (!email) {
      setFormError("Email is required.");
      return;
    }

    if (!editingId && !formData.password) {
      setFormError("Password is required.");
      return;
    }

    try {
      setSaveLoading(true);

      const payload: Record<string, string> = {
        name,
        email,
        role: formData.role,
      };

      if (formData.password) {
        payload.password = formData.password;
      }

      const response = await fetch(
        editingId ? `/api/staff/${editingId}` : "/api/staff",
        {
          method: editingId ? "PATCH" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        },
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error ?? "Unable to save staff member");
      }

      await fetchStaff();
      closeForm();
    } catch (err) {
      console.error(err);
      setFormError(
        err instanceof Error ? err.message : "Unable to save staff member.",
      );
    } finally {
      setSaveLoading(false);
    }
  };

  const handleDelete = async (memberId: string) => {
    const member = staff.find((item) => item._id === memberId);
    const confirmed = window.confirm(
      member
        ? `Delete ${member.name}? This action cannot be undone.`
        : "Delete this staff member?",
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeleteLoadingId(memberId);
      const response = await fetch(`/api/staff/${memberId}`, {
        method: "DELETE",
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error ?? "Unable to delete staff member");
      }

      await fetchStaff();
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error ? err.message : "Unable to delete staff member.",
      );
    } finally {
      setDeleteLoadingId(null);
    }
  };

  const allRows = staff.map(toRow);
  const dentistRows = staff.filter((s) => s.role === "dentist").map(toRow);
  const managerRows = staff.filter((s) => s.role === "manager").map(toRow);
  const receptionistRows = staff
    .filter((s) => s.role === "receptionist")
    .map(toRow);

  const columns: Column<StaffRow>[] = [
    {
      key: "name",
      label: "Staff Member",
      render: (s) => (
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-primary text-xs font-semibold text-white">
            {s.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .substring(0, 2)
              .toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="truncate font-medium text-text-heading">{s.name}</p>
            <p className="truncate text-xs text-text-muted">{s.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "displayRole",
      label: "Role",
    },
    {
      key: "role",
      label: "Status",
      render: () => <StatusBadge status="Active" variant="success" />,
    },
    {
      key: "actions",
      label: "Actions",
      render: (s) => (
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label={`Edit ${s.name}`}
            onClick={() => { 
              const member = staff.find((item) => item._id === s._id);
              if (member) openEditForm(member);
            }}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border-default bg-white text-text-body transition-colors hover:border-brand-primary hover:text-brand-primary"
          >
            <Pencil size={15} strokeWidth={2} />
          </button>
          <button
            type="button"
            aria-label={`Delete ${s.name}`}
            disabled={deleteLoadingId === s._id}
            onClick={() => handleDelete(s._id)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-red-200 bg-red-50 text-red-600 transition-colors hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {deleteLoadingId === s._id ? (
              <span className="text-[10px] font-semibold">...</span>
            ) : (
              <Trash2 size={15} strokeWidth={2} />
            )}
          </button>
        </div>
      ),
    },
  ];

  const renderContent = (rows: StaffRow[]) => {
    if (loading) {
      return (
        <div className="rounded-xl border border-border-default px-4 py-10 text-center text-sm text-text-muted">
          Loading staff...
        </div>
      );
    }

    if (error) {
      return (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      );
    }

    return (
      <DataTable
        columns={columns}
        data={rows}
        emptyMessage="No staff members found"
      />
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Staff Directory"
        description="Manage your clinic team, roles, and administrative access."
        action={{
          label: "Add Staff Member",
          onClick: openCreateForm,
        }}
      />

      {showForm && (
        <div className="rounded-xl border border-border-default bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-text-heading">
                {editingId ? "Edit Staff Member" : "Add Staff Member"}
              </h3>
              <p className="text-sm text-text-muted">
                {editingId
                  ? "Update the staff member information below."
                  : "Create a new staff account for this clinic."}
              </p>
            </div>
            <button
              type="button"
              onClick={closeForm}
              className="text-sm font-medium text-text-muted transition-colors hover:text-text-heading"
            >
              Cancel
            </button>
          </div>

          {formError && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
              {formError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1 md:col-span-2">
              <label className="text-sm font-medium text-text-heading">
                Full name
              </label>
              <input
                value={formData.name}
                onChange={(event) => handleFieldChange("name", event.target.value)}
                className="w-full rounded-md border border-border-default bg-white px-3 py-2 text-sm text-text-body outline-none transition focus:border-brand-primary"
                placeholder="Jane Doe"
              />
            </div>

            <div className="space-y-1 md:col-span-2">
              <label className="text-sm font-medium text-text-heading">
                Email address
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(event) => handleFieldChange("email", event.target.value)}
                className="w-full rounded-md border border-border-default bg-white px-3 py-2 text-sm text-text-body outline-none transition focus:border-brand-primary"
                placeholder="jane@clinic.com"
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-text-heading">
                Role
              </label>
              <select
                value={formData.role}
                onChange={(event) => handleFieldChange("role", event.target.value)}
                className="w-full rounded-md border border-border-default bg-white px-3 py-2 text-sm text-text-body outline-none transition focus:border-brand-primary"
              >
                {Object.entries(ROLE_LABEL).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-text-heading">
                {editingId ? "New password (optional)" : "Password"}
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(event) => handleFieldChange("password", event.target.value)}
                className="w-full rounded-md border border-border-default bg-white px-3 py-2 text-sm text-text-body outline-none transition focus:border-brand-primary"
                placeholder={editingId ? "Leave blank to keep current password" : "••••••••"}
              />
            </div>

            <div className="md:col-span-2 flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={closeForm}
                className="rounded-md border border-border-default bg-white px-4 py-2 text-sm font-medium text-text-body transition-colors hover:bg-neutral-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saveLoading}
                className="rounded-md bg-brand-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-primary-hover disabled:cursor-not-allowed disabled:opacity-70"
              >
                {saveLoading
                  ? "Saving..."
                  : editingId
                    ? "Save Changes"
                    : "Add Staff Member"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-border-default bg-white p-6 shadow-sm">
        <Tabs
          tabs={[
            {
              id: "all",
              label: "All Staff",
              content: renderContent(allRows),
            },
            {
              id: "dentists",
              label: "Dentists",
              content: renderContent(dentistRows),
            },
            {
              id: "managers",
              label: "Managers",
              content: renderContent(managerRows),
            },
            {
              id: "receptionists",
              label: "Receptionists",
              content: renderContent(receptionistRows),
            },
          ]}
        />
      </div>
    </div>
  );
}

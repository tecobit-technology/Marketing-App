"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Download, FileText, Pencil, Plus, ReceiptText, Trash2, Wallet } from "lucide-react";
import PageHeader from "@/components/admin/shared/PageHeader";
import StatCard from "@/components/admin/dashboard/StatCard";
import Tabs from "@/components/admin/shared/Tabs";
import DataTable, { Column } from "@/components/admin/shared/DataTable";
import StatusBadge from "@/components/admin/shared/StatusBadge";
import { generateInvoicePdfBlob } from "@/components/admin/billing/InvoicePDF";
import { generatePaymentReceiptPdfBlob } from "@/components/admin/billing/PaymentReceiptPDF";

type InvoiceStatus = "draft" | "pending" | "paid" | "overdue";

interface PatientOption {
  _id: string;
  fullName: string;
  email?: string;
  phone?: string;
}

interface InvoiceItemForm {
  description: string;
  quantity: number;
  unitPrice: number;
  notes: string;
}

interface InvoiceFormState {
  patientId: string;
  dueDate: string;
  notes: string;
  items: InvoiceItemForm[];
}

interface InvoiceRow {
  _id: string;
  invoiceNumber: string;
  patientId: PatientOption | null;
  issueDate: string | null;
  dueDate: string | null;
  totalAmount: number;
  paidAmount: number;
  remainingBalance: number;
  status: InvoiceStatus | string;
  notes?: string;
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    totalAmount: number;
    notes?: string;
  }>;
  actions?: React.ReactNode;
}

interface PaymentRow {
  _id: string;
  receiptNumber: string;
  amount: number;
  paymentDate: string | null;
  paymentMethod: string;
  notes?: string;
  invoiceId?: { _id: string; invoiceNumber?: string } | null;
  patientId?: PatientOption | null;
}

const EMPTY_INVOICE_FORM: InvoiceFormState = {
  patientId: "",
  dueDate: "",
  notes: "",
  items: [{ description: "", quantity: 1, unitPrice: 0, notes: "" }],
};

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const money = (value: number) => currencyFormatter.format(Number(value ?? 0));

const formatDate = (value: string | null) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url, { cache: "no-store" });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error((data as { error?: string }).error ?? "Request failed");
  }

  return response.json() as Promise<T>;
}

export default function BillingPage() {
  const [invoices, setInvoices] = useState<InvoiceRow[]>([]);
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [patients, setPatients] = useState<PatientOption[]>([]);
  const [stats, setStats] = useState({
    totalRevenueMTD: 0,
    pendingPayments: 0,
    outstandingOverdue: 0,
    totalInvoices: 0,
    paidInvoices: 0,
    pendingInvoices: 0,
    overdueInvoices: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showInvoiceForm, setShowInvoiceForm] = useState(false);
  const [editingInvoiceId, setEditingInvoiceId] = useState<string | null>(null);
  const [saveLoading, setSaveLoading] = useState(false);
  const [deleteLoadingId, setDeleteLoadingId] = useState<string | null>(null);
  const [invoiceForm, setInvoiceForm] = useState<InvoiceFormState>(EMPTY_INVOICE_FORM);
  const [invoiceFormError, setInvoiceFormError] = useState("");
  const [paymentForm, setPaymentForm] = useState({
    amount: "",
    paymentMethod: "cash",
    notes: "",
    paymentDate: new Date().toISOString().slice(0, 10),
  });
  const [selectedPaymentInvoiceId, setSelectedPaymentInvoiceId] = useState<string>("");
  const [recordingPaymentId, setRecordingPaymentId] = useState<string | null>(null);
  const [paymentError, setPaymentError] = useState("");

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const [patientData, invoiceData, paymentData, statsData] = await Promise.all([
        fetchJson<PatientOption[]>("/api/patients"),
        fetchJson<InvoiceRow[]>("/api/invoices"),
        fetchJson<PaymentRow[]>("/api/payments"),
        fetchJson<typeof stats>("/api/billing/stats"),
      ]);

      setPatients(Array.isArray(patientData) ? patientData : []);
      setInvoices(Array.isArray(invoiceData) ? invoiceData : []);
      setPayments(Array.isArray(paymentData) ? paymentData : []);
      setStats((previous) => ({
        ...previous,
        ...(statsData ?? {}),
      }));
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Failed to load billing data.");
      setPatients([]);
      setInvoices([]);
      setPayments([]);
      setStats({
        totalRevenueMTD: 0,
        pendingPayments: 0,
        outstandingOverdue: 0,
        totalInvoices: 0,
        paidInvoices: 0,
        pendingInvoices: 0,
        overdueInvoices: 0,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // This is the standard client-side bootstrap fetch for dashboard data.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadData();
  }, [loadData]);

  const outstandingInvoices = useMemo(
    () => invoices.filter((invoice) => Number(invoice.remainingBalance ?? 0) > 0),
    [invoices],
  );

  const selectedPaymentInvoice = useMemo(
    () => outstandingInvoices.find((invoice) => invoice._id === selectedPaymentInvoiceId) ?? null,
    [outstandingInvoices, selectedPaymentInvoiceId],
  );

  const openCreateInvoiceForm = () => {
    setEditingInvoiceId(null);
    setInvoiceForm({ ...EMPTY_INVOICE_FORM });
    setInvoiceFormError("");
    setShowInvoiceForm(true);
  };

  const openEditInvoiceForm = (invoice: InvoiceRow) => {
    setEditingInvoiceId(invoice._id);
    setInvoiceForm({
      patientId: invoice.patientId?._id ?? "",
      dueDate: invoice.dueDate ? invoice.dueDate.slice(0, 10) : "",
      notes: invoice.notes ?? "",
      items: invoice.items.map((item) => ({
        description: item.description,
        quantity: Number(item.quantity ?? 1),
        unitPrice: Number(item.unitPrice ?? 0),
        notes: item.notes ?? "",
      })),
    });
    setInvoiceFormError("");
    setShowInvoiceForm(true);
  };

  const closeInvoiceForm = () => {
    setShowInvoiceForm(false);
    setEditingInvoiceId(null);
    setInvoiceForm({ ...EMPTY_INVOICE_FORM });
    setInvoiceFormError("");
  };

  const updateItem = (index: number, field: keyof InvoiceItemForm, value: string | number) => {
    setInvoiceForm((previous) => ({
      ...previous,
      items: previous.items.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              [field]: value,
            }
          : item,
      ),
    }));
  };

  const addInvoiceItem = () => {
    setInvoiceForm((previous) => ({
      ...previous,
      items: [...previous.items, { description: "", quantity: 1, unitPrice: 0, notes: "" }],
    }));
  };

  const removeInvoiceItem = (index: number) => {
    setInvoiceForm((previous) => ({
      ...previous,
      items: previous.items.length > 1 ? previous.items.filter((_, itemIndex) => itemIndex !== index) : previous.items,
    }));
  };

  const handleSubmitInvoice = async (event: React.FormEvent) => {
    event.preventDefault();
    setInvoiceFormError("");

    if (!invoiceForm.patientId) {
      setInvoiceFormError("Please select a patient.");
      return;
    }

    const sanitizedItems = invoiceForm.items
      .map((item) => ({
        description: item.description.trim(),
        quantity: Number(item.quantity || 1),
        unitPrice: Number(item.unitPrice || 0),
        notes: item.notes.trim(),
      }))
      .filter((item) => item.description.length > 0);

    if (!sanitizedItems.length) {
      setInvoiceFormError("Add at least one invoice item with a description.");
      return;
    }

    try {
      setSaveLoading(true);

      const payload = {
        patientId: invoiceForm.patientId,
        dueDate: invoiceForm.dueDate || undefined,
        notes: invoiceForm.notes.trim(),
        items: sanitizedItems,
      };

      const response = await fetch(
        editingInvoiceId ? `/api/invoices/${editingInvoiceId}` : "/api/invoices",
        {
          method: editingInvoiceId ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error((data as { error?: string }).error ?? "Unable to save invoice.");
      }

      closeInvoiceForm();
      await loadData();
    } catch (err) {
      console.error(err);
      setInvoiceFormError(err instanceof Error ? err.message : "Unable to save invoice.");
    } finally {
      setSaveLoading(false);
    }
  };

  const handleDeleteInvoice = async (invoiceId: string) => {
    const invoice = invoices.find((item) => item._id === invoiceId);
    const confirmed = window.confirm(
      invoice ? `Delete ${invoice.invoiceNumber}? This cannot be undone.` : "Delete this invoice?",
    );

    if (!confirmed) return;

    try {
      setDeleteLoadingId(invoiceId);
      const response = await fetch(`/api/invoices/${invoiceId}`, { method: "DELETE" });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error((data as { error?: string }).error ?? "Unable to delete invoice.");
      }

      await loadData();
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Unable to delete invoice.");
    } finally {
      setDeleteLoadingId(null);
    }
  };

  const handlePaymentSubmit = async (invoiceId?: string) => {
    const activeInvoiceId = invoiceId ?? selectedPaymentInvoiceId;

    if (!activeInvoiceId) {
      setPaymentError("Please select an invoice before recording a payment.");
      return;
    }

    const invoice = invoices.find((row) => row._id === activeInvoiceId);
    const amount = Number(paymentForm.amount);

    if (!invoice) {
      setPaymentError("The selected invoice could not be found.");
      return;
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      setPaymentError("Please enter a valid payment amount.");
      return;
    }

    if (amount > Number(invoice.remainingBalance ?? 0)) {
      setPaymentError("Payment amount cannot exceed the selected invoice's remaining balance.");
      return;
    }

    try {
      setRecordingPaymentId(activeInvoiceId);
      setPaymentError("");

      const response = await fetch(`/api/invoices/${activeInvoiceId}/payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount,
          paymentDate: paymentForm.paymentDate,
          paymentMethod: paymentForm.paymentMethod,
          notes: paymentForm.notes.trim(),
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error((data as { error?: string }).error ?? "Unable to record payment.");
      }

      setSelectedPaymentInvoiceId("");
      setPaymentForm({
        amount: "",
        paymentMethod: "cash",
        notes: "",
        paymentDate: new Date().toISOString().slice(0, 10),
      });
      await loadData();
    } catch (err) {
      console.error(err);
      setPaymentError(err instanceof Error ? err.message : "Unable to record payment.");
    } finally {
      setRecordingPaymentId(null);
    }
  };

  const downloadInvoice = async (invoice: InvoiceRow) => {
    const clinic = {
      name: "Dental Clinic",
      address: "Main Street",
      city: "Biratnagar",
      phone: "+977 01 123456",
      email: "billing@clinic.com",
    };

    const blob = await generateInvoicePdfBlob(
      {
        invoiceNumber: invoice.invoiceNumber,
        issueDate: invoice.issueDate,
        dueDate: invoice.dueDate,
        status: invoice.status,
        totalAmount: invoice.totalAmount,
        paidAmount: invoice.paidAmount,
        notes: invoice.notes,
        items: invoice.items.map((item) => ({
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalAmount: item.totalAmount,
        })),
      },
      invoice.patientId ?? undefined,
      clinic,
    );

    const url = URL.createObjectURL(blob);
    const popup = window.open(url, "_blank");
    if (popup) {
      popup.focus();
    }
  };

  const downloadReceipt = async (payment: PaymentRow) => {
    const invoice = invoices.find((row) => row._id === payment.invoiceId?._id);
    const clinic = {
      name: "Dental Clinic",
      address: "Main Street",
      city: "Biratnagar",
      phone: "+977 01 123456",
      email: "billing@clinic.com",
    };

    const blob = await generatePaymentReceiptPdfBlob(
      {
        receiptNumber: payment.receiptNumber,
        amount: payment.amount,
        paymentDate: payment.paymentDate,
        paymentMethod: payment.paymentMethod,
        notes: payment.notes,
      },
      invoice
        ? {
            invoiceNumber: invoice.invoiceNumber,
            totalAmount: invoice.totalAmount,
          }
        : undefined,
      payment.patientId ?? undefined,
      clinic,
    );

    const url = URL.createObjectURL(blob);
    const popup = window.open(url, "_blank");
    if (popup) {
      popup.focus();
    }
  };

  const invoiceColumns: Column<InvoiceRow>[] = [
    {
      key: "invoiceNumber",
      label: "Invoice",
      render: (row) => (
        <div>
          <p className="font-semibold text-text-heading">{row.invoiceNumber}</p>
          <p className="text-xs text-text-muted">{formatDate(row.issueDate)}</p>
        </div>
      ),
    },
    {
      key: "patientId",
      label: "Patient",
      render: (row) => <span>{row.patientId?.fullName ?? "Unknown"}</span>,
    },
    {
      key: "dueDate",
      label: "Due Date",
      render: (row) => <span>{formatDate(row.dueDate)}</span>,
    },
    {
      key: "totalAmount",
      label: "Total",
      render: (row) => <span className="font-medium text-text-heading">{money(row.totalAmount)}</span>,
    },
    {
      key: "remainingBalance",
      label: "Balance",
      render: (row) => <span>{money(row.remainingBalance)}</span>,
    },
    {
      key: "status",
      label: "Status",
      render: (row) => <StatusBadge status={String(row.status ?? "pending")} />,
    },
    {
      key: "actions",
      label: "Actions",
      render: (row) => (
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label={`View ${row.invoiceNumber}`}
            onClick={() => downloadInvoice(row)}
            className="rounded-md border border-border-default bg-white p-2 text-text-body hover:border-brand-primary hover:text-brand-primary"
          >
            <Download size={15} />
          </button>
          <button
            type="button"
            aria-label={`Edit ${row.invoiceNumber}`}
            onClick={() => openEditInvoiceForm(row)}
            className="rounded-md border border-border-default bg-white p-2 text-text-body hover:border-brand-primary hover:text-brand-primary"
          >
            <Pencil size={15} />
          </button>
          <button
            type="button"
            aria-label={`Delete ${row.invoiceNumber}`}
            onClick={() => handleDeleteInvoice(row._id)}
            disabled={deleteLoadingId === row._id}
            className="rounded-md border border-red-200 bg-red-50 p-2 text-red-600 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {deleteLoadingId === row._id ? "..." : <Trash2 size={15} />}
          </button>
        </div>
      ),
    },
  ];

  const paymentColumns: Column<PaymentRow>[] = [
    {
      key: "receiptNumber",
      label: "Receipt",
      render: (row) => <span className="font-semibold text-text-heading">{row.receiptNumber}</span>,
    },
    {
      key: "patientId",
      label: "Patient",
      render: (row) => <span>{row.patientId?.fullName ?? "Unknown"}</span>,
    },
    {
      key: "invoiceId",
      label: "Invoice",
      render: (row) => <span>{row.invoiceId?.invoiceNumber ?? "—"}</span>,
    },
    {
      key: "paymentDate",
      label: "Date",
      render: (row) => <span>{formatDate(row.paymentDate)}</span>,
    },
    {
      key: "amount",
      label: "Amount",
      render: (row) => <span className="font-medium text-text-heading">{money(row.amount)}</span>,
    },
    {
      key: "paymentMethod",
      label: "Method",
      render: (row) => <span className="capitalize">{row.paymentMethod}</span>,
    },
    {
      key: "actions",
      label: "Actions",
      render: (row) => (
        <button
          type="button"
          onClick={() => downloadReceipt(row)}
          className="inline-flex items-center gap-2 rounded-md border border-border-default bg-white px-3 py-2 text-sm text-text-body hover:border-brand-primary hover:text-brand-primary"
        >
          <ReceiptText size={15} />
          Receipt
        </button>
      ),
    },
  ];

  const tabs = [
    {
      id: "invoices",
      label: "All Invoices",
      content: loading ? (
        <div className="rounded-xl border border-border-default px-4 py-10 text-center text-sm text-text-muted">Loading billing data...</div>
      ) : error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
      ) : (
        <DataTable columns={invoiceColumns} data={invoices} emptyMessage="No invoices found" />
      ),
    },
    {
      id: "payments",
      label: "Payment History",
      content: loading ? (
        <div className="rounded-xl border border-border-default px-4 py-10 text-center text-sm text-text-muted">Loading payment history...</div>
      ) : (
        <DataTable columns={paymentColumns} data={payments} emptyMessage="No payment history found" />
      ),
    },
    {
      id: "outstanding",
      label: "Outstanding Balances",
      content: loading ? (
        <div className="rounded-xl border border-border-default px-4 py-10 text-center text-sm text-text-muted">Loading outstanding balances...</div>
      ) : (
        <DataTable columns={invoiceColumns} data={outstandingInvoices} emptyMessage="No outstanding balances found" />
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Billing & Finance"
        description="Track clinic revenue, invoices, outstanding balances, and patient payments."
        action={{ label: "Create Invoice", onClick: openCreateInvoiceForm }}
      />

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Revenue (MTD)"
          value={money(stats.totalRevenueMTD)}
          trend={{ value: `${stats.totalInvoices || 0} invoices`, isPositive: true }}
        />
        <StatCard label="Pending Payments" value={money(stats.pendingPayments)} />
        <StatCard
          label="Outstanding Overdue"
          value={money(stats.outstandingOverdue)}
          trend={{ value: `${stats.overdueInvoices || 0} overdue`, isPositive: false }}
        />
        <StatCard label="Paid Invoices" value={String(stats.paidInvoices || 0)} />
      </div>

      {showInvoiceForm && (
        <div className="rounded-xl border border-border-default bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-text-heading">
                {editingInvoiceId ? "Edit Invoice" : "Create Invoice"}
              </h3>
              <p className="text-sm text-text-muted">
                {editingInvoiceId ? "Update invoice details and items." : "Create a new invoice for a patient."}
              </p>
            </div>
            <button type="button" onClick={closeInvoiceForm} className="text-sm font-medium text-text-muted hover:text-text-heading">
              Cancel
            </button>
          </div>

          {invoiceFormError && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
              {invoiceFormError}
            </div>
          )}

          <form onSubmit={handleSubmitInvoice} className="space-y-5">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1">
                <label className="text-sm font-medium text-text-heading">Patient</label>
                <select
                  value={invoiceForm.patientId}
                  onChange={(event) => setInvoiceForm((previous) => ({ ...previous, patientId: event.target.value }))}
                  className="w-full rounded-md border border-border-default bg-white px-3 py-2 text-sm text-text-body outline-none transition focus:border-brand-primary"
                >
                  <option value="">Select patient</option>
                  {patients.map((patient) => (
                    <option key={patient._id} value={patient._id}>
                      {patient.fullName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-text-heading">Due Date</label>
                <input
                  type="date"
                  value={invoiceForm.dueDate}
                  onChange={(event) => setInvoiceForm((previous) => ({ ...previous, dueDate: event.target.value }))}
                  className="w-full rounded-md border border-border-default bg-white px-3 py-2 text-sm text-text-body outline-none transition focus:border-brand-primary"
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-text-heading">Invoice Items</label>
                <button type="button" onClick={addInvoiceItem} className="inline-flex items-center gap-2 rounded-md border border-border-default bg-white px-3 py-2 text-sm text-text-body hover:border-brand-primary hover:text-brand-primary">
                  <Plus size={14} /> Add item
                </button>
              </div>

              {invoiceForm.items.map((item, index) => (
                <div key={`invoice-item-${index}`} className="grid gap-3 rounded-lg border border-border-default p-3 md:grid-cols-[1.4fr_0.7fr_0.8fr_auto]">
                  <input
                    value={item.description}
                    onChange={(event) => updateItem(index, "description", event.target.value)}
                    placeholder="Procedure or service"
                    className="rounded-md border border-border-default bg-white px-3 py-2 text-sm text-text-body outline-none transition focus:border-brand-primary"
                  />
                  <input
                    type="number"
                    min={1}
                    value={item.quantity}
                    onChange={(event) => updateItem(index, "quantity", Number(event.target.value || 1))}
                    placeholder="Qty"
                    className="rounded-md border border-border-default bg-white px-3 py-2 text-sm text-text-body outline-none transition focus:border-brand-primary"
                  />
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    value={item.unitPrice}
                    onChange={(event) => updateItem(index, "unitPrice", Number(event.target.value || 0))}
                    placeholder="Price"
                    className="rounded-md border border-border-default bg-white px-3 py-2 text-sm text-text-body outline-none transition focus:border-brand-primary"
                  />
                  <button
                    type="button"
                    onClick={() => removeInvoiceItem(index)}
                    className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 hover:bg-red-100"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-text-heading">Notes</label>
              <textarea
                value={invoiceForm.notes}
                onChange={(event) => setInvoiceForm((previous) => ({ ...previous, notes: event.target.value }))}
                rows={4}
                className="w-full rounded-md border border-border-default bg-white px-3 py-2 text-sm text-text-body outline-none transition focus:border-brand-primary"
                placeholder="Optional invoice note or treatment summary"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button type="button" onClick={closeInvoiceForm} className="rounded-md border border-border-default bg-white px-4 py-2 text-sm font-medium text-text-body hover:bg-neutral-50">
                Cancel
              </button>
              <button type="submit" disabled={saveLoading} className="rounded-md bg-brand-primary px-4 py-2 text-sm font-medium text-white hover:bg-brand-primary-hover disabled:cursor-not-allowed disabled:opacity-70">
                {saveLoading ? "Saving..." : editingInvoiceId ? "Save Invoice" : "Create Invoice"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="rounded-xl border border-border-default bg-white p-6 shadow-sm">
        <Tabs tabs={tabs} />
      </div>

      <div className="rounded-xl border border-border-default bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-3">
          <Wallet className="text-brand-primary" size={18} />
          <h3 className="text-lg font-semibold text-text-heading">Record Payment</h3>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
          <div className="space-y-1 xl:col-span-2">
            <label className="text-xs font-medium uppercase tracking-wide text-text-muted">Invoice</label>
            <select
              value={selectedPaymentInvoiceId}
              onChange={(event) => {
                const nextInvoiceId = event.target.value;
                const nextInvoice = outstandingInvoices.find((invoice) => invoice._id === nextInvoiceId) ?? null;

                setSelectedPaymentInvoiceId(nextInvoiceId);
                setPaymentError("");
                setPaymentForm((previous) => ({
                  ...previous,
                  amount: nextInvoice ? String(Number(nextInvoice.remainingBalance ?? 0)) : "",
                }));
              }}
              className="w-full rounded-md border border-border-default bg-white px-3 py-2 text-sm text-text-body outline-none focus:border-brand-primary"
            >
              <option value="">Select invoice</option>
              {outstandingInvoices.map((invoice) => (
                <option key={invoice._id} value={invoice._id}>
                  {`${invoice.invoiceNumber} — ${invoice.patientId?.fullName ?? "Unknown patient"} — Balance: ${money(invoice.remainingBalance)}`}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium uppercase tracking-wide text-text-muted">Payment method</label>
            <select
              value={paymentForm.paymentMethod}
              onChange={(event) => setPaymentForm((previous) => ({ ...previous, paymentMethod: event.target.value }))}
              className="w-full rounded-md border border-border-default bg-white px-3 py-2 text-sm text-text-body outline-none focus:border-brand-primary"
            >
              <option value="cash">Cash</option>
              <option value="card">Card</option>
              <option value="bank">Bank Transfer</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium uppercase tracking-wide text-text-muted">Payment date</label>
            <input
              type="date"
              value={paymentForm.paymentDate}
              onChange={(event) => setPaymentForm((previous) => ({ ...previous, paymentDate: event.target.value }))}
              className="w-full rounded-md border border-border-default bg-white px-3 py-2 text-sm text-text-body outline-none focus:border-brand-primary"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium uppercase tracking-wide text-text-muted">Amount</label>
            <input
              type="number"
              min={0}
              step="0.01"
              max={selectedPaymentInvoice ? Number(selectedPaymentInvoice.remainingBalance ?? 0) : undefined}
              value={paymentForm.amount}
              onChange={(event) => setPaymentForm((previous) => ({ ...previous, amount: event.target.value }))}
              placeholder="Amount"
              className="w-full rounded-md border border-border-default bg-white px-3 py-2 text-sm text-text-body outline-none focus:border-brand-primary"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium uppercase tracking-wide text-text-muted">Notes</label>
            <input
              value={paymentForm.notes}
              onChange={(event) => setPaymentForm((previous) => ({ ...previous, notes: event.target.value }))}
              placeholder="Notes"
              className="w-full rounded-md border border-border-default bg-white px-3 py-2 text-sm text-text-body outline-none focus:border-brand-primary"
            />
          </div>

          <button
            type="button"
            onClick={() => void handlePaymentSubmit()}
            disabled={recordingPaymentId !== null || !selectedPaymentInvoiceId}
            className="inline-flex items-center justify-center gap-2 self-end rounded-md bg-brand-primary px-4 py-2 text-sm font-medium text-white hover:bg-brand-primary-hover disabled:cursor-not-allowed disabled:opacity-70"
          >
            <FileText size={15} />
            {recordingPaymentId !== null ? "Recording..." : "Record Payment"}
          </button>
        </div>

        {selectedPaymentInvoice && (
          <div className="mt-4 rounded-lg border border-border-default bg-neutral-50 p-4">
            <div className="mb-2 text-xs font-medium uppercase tracking-wide text-text-muted">Selected invoice</div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
              <div>
                <div className="text-xs text-text-muted">Patient</div>
                <div className="font-medium text-text-heading">{selectedPaymentInvoice.patientId?.fullName ?? "Unknown"}</div>
              </div>
              <div>
                <div className="text-xs text-text-muted">Invoice</div>
                <div className="font-medium text-text-heading">{selectedPaymentInvoice.invoiceNumber}</div>
              </div>
              <div>
                <div className="text-xs text-text-muted">Invoice total</div>
                <div className="font-medium text-text-heading">{money(selectedPaymentInvoice.totalAmount)}</div>
              </div>
              <div>
                <div className="text-xs text-text-muted">Already paid</div>
                <div className="font-medium text-text-heading">{money(selectedPaymentInvoice.paidAmount)}</div>
              </div>
              <div>
                <div className="text-xs text-text-muted">Remaining</div>
                <div className="font-medium text-text-heading">{money(selectedPaymentInvoice.remainingBalance)}</div>
              </div>
            </div>
          </div>
        )}

        {paymentError && (
          <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
            {paymentError}
          </div>
        )}
      </div>
    </div>
  );
}

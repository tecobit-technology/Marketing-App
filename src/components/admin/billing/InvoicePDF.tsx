"use client";

import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  pdf,
} from "@react-pdf/renderer";

interface InvoicePDFItem {
  description: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
}

interface InvoicePDFProps {
  invoice: {
    invoiceNumber: string;
    issueDate?: string | Date | null;
    dueDate?: string | Date | null;
    status?: string;
    totalAmount?: number;
    paidAmount?: number;
    notes?: string;
    items?: InvoicePDFItem[];
  };
  patient?: {
    fullName?: string;
    phone?: string;
    email?: string;
  };
  clinic?: {
    name?: string;
    address?: string;
    city?: string;
    phone?: string;
    email?: string;
  };
}

const DEFAULT_ISSUE_DATE = new Date();

const styles = StyleSheet.create({
  page: {
    padding: 32,
    fontFamily: "Helvetica",
    color: "#1f2937",
    backgroundColor: "#ffffff",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#d1d5db",
    paddingBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 700,
    marginBottom: 8,
  },
  muted: {
    fontSize: 10,
    color: "#4b5563",
    marginBottom: 2,
  },
  section: {
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 700,
    marginBottom: 6,
    color: "#111827",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f3f4f6",
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#d1d5db",
  },
  tableRow: {
    flexDirection: "row",
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  col1: { width: "36%" },
  col2: { width: "16%" },
  col3: { width: "18%" },
  col4: { width: "18%" },
  col5: { width: "12%" },
  text: { fontSize: 10 },
  summaryBox: {
    marginTop: 16,
    alignSelf: "flex-end",
    width: 220,
    borderWidth: 1,
    borderColor: "#d1d5db",
    padding: 12,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  footer: {
    position: "absolute",
    bottom: 18,
    left: 32,
    right: 32,
    borderTopWidth: 1,
    borderTopColor: "#d1d5db",
    paddingTop: 8,
    fontSize: 9,
    color: "#6b7280",
  },
});

export function InvoicePDFDocument({ invoice, patient, clinic }: InvoicePDFProps) {
  const items = invoice.items ?? [];
  const totalAmount = Number(invoice.totalAmount ?? items.reduce((sum, item) => sum + item.totalAmount, 0));
  const paidAmount = Number(invoice.paidAmount ?? 0);
  const remainingBalance = Math.max(totalAmount - paidAmount, 0);
  const issueDate = invoice.issueDate ? new Date(invoice.issueDate) : DEFAULT_ISSUE_DATE;
  const dueDate = invoice.dueDate ? new Date(invoice.dueDate) : null;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.title}>{clinic?.name ?? "Clinic"}</Text>
            <Text style={styles.muted}>{clinic?.address ?? ""}</Text>
            <Text style={styles.muted}>{clinic?.city ?? ""}</Text>
            <Text style={styles.muted}>{clinic?.phone ?? ""}</Text>
            <Text style={styles.muted}>{clinic?.email ?? ""}</Text>
          </View>
          <View>
            <Text style={styles.title}>Invoice</Text>
            <Text style={styles.muted}>#{invoice.invoiceNumber}</Text>
            <Text style={styles.muted}>Issue Date: {issueDate.toLocaleDateString()}</Text>
            <Text style={styles.muted}>Due Date: {dueDate ? dueDate.toLocaleDateString() : "N/A"}</Text>
            <Text style={styles.muted}>Status: {invoice.status ?? "pending"}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bill To</Text>
          <Text style={styles.text}>{patient?.fullName ?? "Unknown patient"}</Text>
          <Text style={styles.text}>{patient?.phone ?? ""}</Text>
          <Text style={styles.text}>{patient?.email ?? ""}</Text>
        </View>

        <View style={styles.tableHeader}>
          <Text style={[styles.text, styles.col1]}>Description</Text>
          <Text style={[styles.text, styles.col2]}>Qty</Text>
          <Text style={[styles.text, styles.col3]}>Unit Price</Text>
          <Text style={[styles.text, styles.col4]}>Line Total</Text>
        </View>

        {items.map((item, index) => (
          <View style={styles.tableRow} key={`${item.description}-${index}`}>
            <Text style={[styles.text, styles.col1]}>{item.description}</Text>
            <Text style={[styles.text, styles.col2]}>{item.quantity}</Text>
            <Text style={[styles.text, styles.col3]}>{Number(item.unitPrice).toFixed(2)}</Text>
            <Text style={[styles.text, styles.col4]}>{Number(item.totalAmount).toFixed(2)}</Text>
          </View>
        ))}

        <View style={styles.summaryBox}>
          <View style={styles.summaryRow}>
            <Text style={styles.text}>Subtotal</Text>
            <Text style={styles.text}>{Number(totalAmount).toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.text}>Total</Text>
            <Text style={styles.text}>{Number(totalAmount).toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.text}>Paid</Text>
            <Text style={styles.text}>{Number(paidAmount).toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.text}>Balance</Text>
            <Text style={styles.text}>{Number(remainingBalance).toFixed(2)}</Text>
          </View>
        </View>

        {invoice.notes ? (
          <View style={[styles.section, { marginTop: 18 }]}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <Text style={styles.text}>{invoice.notes}</Text>
          </View>
        ) : null}

        <Text style={styles.footer}>Generated by mysaas dental billing system.</Text>
      </Page>
    </Document>
  );
}

export async function generateInvoicePdfBlob(invoice: InvoicePDFProps["invoice"], patient: InvoicePDFProps["patient"], clinic: InvoicePDFProps["clinic"]) {
  const doc = <InvoicePDFDocument invoice={invoice} patient={patient} clinic={clinic} />;
  const asPdf = pdf(doc);
  return await asPdf.toBlob();
}

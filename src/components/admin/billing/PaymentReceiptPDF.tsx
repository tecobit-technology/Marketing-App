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

interface PaymentReceiptPDFProps {
  payment: {
    receiptNumber?: string;
    amount?: number;
    paymentDate?: string | Date | null;
    paymentMethod?: string;
    notes?: string;
  };
  invoice?: {
    invoiceNumber?: string;
    totalAmount?: number;
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

const styles = StyleSheet.create({
  page: {
    padding: 32,
    fontFamily: "Helvetica",
    color: "#111827",
    backgroundColor: "#ffffff",
  },
  title: {
    fontSize: 22,
    fontWeight: 700,
    marginBottom: 12,
  },
  muted: {
    fontSize: 10,
    color: "#4b5563",
    marginBottom: 4,
  },
  section: {
    marginBottom: 18,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  label: {
    fontSize: 11,
    color: "#374151",
  },
  value: {
    fontSize: 11,
    fontWeight: 600,
  },
  box: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    padding: 12,
    marginTop: 12,
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

export function PaymentReceiptPDFDocument({ payment, invoice, patient, clinic }: PaymentReceiptPDFProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>{clinic?.name ?? "Clinic"} — Payment Receipt</Text>
        <Text style={styles.muted}>Receipt #{payment.receiptNumber ?? "PAY-0000"}</Text>

        <View style={styles.section}>
          <Text style={styles.muted}>{clinic?.address ?? ""}</Text>
          <Text style={styles.muted}>{clinic?.city ?? ""}</Text>
          <Text style={styles.muted}>{clinic?.phone ?? ""}</Text>
          <Text style={styles.muted}>{clinic?.email ?? ""}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Paid by: {patient?.fullName ?? "Patient"}</Text>
          <Text style={styles.label}>Phone: {patient?.phone ?? "N/A"}</Text>
          <Text style={styles.label}>Email: {patient?.email ?? "N/A"}</Text>
        </View>

        <View style={styles.box}>
          <View style={styles.row}>
            <Text style={styles.label}>Invoice</Text>
            <Text style={styles.value}>{invoice?.invoiceNumber ?? "N/A"}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Method</Text>
            <Text style={styles.value}>{payment.paymentMethod ?? "cash"}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Date</Text>
            <Text style={styles.value}>{payment.paymentDate ? new Date(payment.paymentDate).toLocaleDateString() : "N/A"}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Amount</Text>
            <Text style={styles.value}>{Number(payment.amount ?? 0).toFixed(2)}</Text>
          </View>
        </View>

        {payment.notes ? (
          <View style={[styles.section, { marginTop: 16 }]}>
            <Text style={styles.label}>Notes</Text>
            <Text style={styles.muted}>{payment.notes}</Text>
          </View>
        ) : null}

        <Text style={styles.footer}>Thank you for your payment. Please keep this receipt for your records.</Text>
      </Page>
    </Document>
  );
}

export async function generatePaymentReceiptPdfBlob(
  payment: PaymentReceiptPDFProps["payment"],
  invoice: PaymentReceiptPDFProps["invoice"],
  patient: PaymentReceiptPDFProps["patient"],
  clinic: PaymentReceiptPDFProps["clinic"],
) {
  const doc = <PaymentReceiptPDFDocument payment={payment} invoice={invoice} patient={patient} clinic={clinic} />;
  const asPdf = pdf(doc);
  return await asPdf.toBlob();
}

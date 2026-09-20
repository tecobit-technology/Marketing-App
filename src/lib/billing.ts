import mongoose, { type ClientSession } from 'mongoose';
import { connectToDatabase } from '@/lib/db';
import { Counter, Invoice, Payment } from '@/lib/models';

export class BillingError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = 'BillingError';
    this.status = status;
  }
}

export function roundMoney(value: number): number {
  const amount = Number(value ?? 0);
  if (!Number.isFinite(amount)) return 0;
  return Math.round((amount + Number.EPSILON) * 100) / 100;
}

export function assertMoneyIntegrity(totalAmount: number, paidAmount: number): void {
  const total = roundMoney(totalAmount);
  const paid = roundMoney(paidAmount);

  if (!Number.isFinite(total) || !Number.isFinite(paid)) {
    throw new BillingError('Invoice totals are invalid', 400);
  }

  if (total < 0 || paid < 0 || paid > total) {
    throw new BillingError('Invoice payment totals are invalid', 400);
  }
}

function isTransactionUnsupportedError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return (
    message.includes('Transaction numbers are only allowed on a replica set member or mongos') ||
    message.includes('Transactions are not supported by this deployment') ||
    message.includes('Transaction numbers are only allowed')
  );
}

export async function runInTransaction<T>(fn: (session: ClientSession) => Promise<T>): Promise<T> {
  await connectToDatabase();
  const maxAttempts = 3;

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const session = await mongoose.startSession();

    try {
      let result: T | undefined;
      await session.withTransaction(async () => {
        result = await fn(session);
      });
      return result as T;
    } catch (error) {
      await session.endSession().catch(() => {});

      if (isTransactionUnsupportedError(error)) {
        console.warn('[billing] MongoDB transactions unsupported on this deployment; using atomic single-doc updates.');
        return fn(undefined as unknown as ClientSession);
      }

      const code = (error as { code?: number } | null)?.code;
      if (code === 11000 && attempt < maxAttempts - 1) {
        console.warn('[billing] Duplicate key during transaction; retrying.');
        continue;
      }

      throw error;
    }
  }

  throw new BillingError('Transaction failed after retries', 500);
}

export async function nextSequence(
  clinicId: string,
  key: string,
  prefix: string,
  session?: ClientSession,
): Promise<number> {
  const doc = await Counter.findOneAndUpdate(
    { clinicId, key },
    { $inc: { seq: 1 } },
    { new: true, upsert: true, setDefaultsOnInsert: true, session },
  ).lean();

  if (!doc?.seq) {
    throw new BillingError('Failed to allocate a sequence number', 500);
  }

  return Number(doc.seq);
}

export async function allocateInvoiceNumber(
  clinicId: string,
  session?: ClientSession,
): Promise<string> {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const seq = await nextSequence(clinicId, 'invoiceNumber', 'INV', session);
    const number = `INV-${seq}`;
    const count = await Invoice.countDocuments(
      { invoiceNumber: number },
      { session },
    ).catch(() => 0);
    if (count === 0) return number;
  }
  throw new BillingError('Could not allocate a unique invoice number', 500);
}

export async function allocateReceiptNumber(
  clinicId: string,
  session?: ClientSession,
): Promise<string> {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const seq = await nextSequence(clinicId, 'receiptNumber', 'PAY', session);
    const number = `PAY-${seq}`;
    const count = await Payment.countDocuments(
      { receiptNumber: number },
      { session },
    ).catch(() => 0);
    if (count === 0) return number;
  }
  throw new BillingError('Could not allocate a unique receipt number', 500);
}

export function deriveInvoiceStatus(invoice: {
  totalAmount: number;
  paidAmount: number;
  dueDate?: Date | string | null;
}): 'paid' | 'overdue' | 'pending' {
  const totalAmount = roundMoney(invoice.totalAmount);
  const paidAmount = roundMoney(invoice.paidAmount);
  const remainingBalance = Math.max(totalAmount - paidAmount, 0);
  const dueDate = invoice.dueDate ? new Date(invoice.dueDate) : null;

  if (remainingBalance <= 0) return 'paid';
  if (dueDate && dueDate < new Date()) return 'overdue';
  return 'pending';
}
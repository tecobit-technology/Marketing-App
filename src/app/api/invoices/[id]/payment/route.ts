import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db';
import { Invoice, Payment } from '@/lib/models';
import {
  BillingError,
  allocateReceiptNumber,
  assertMoneyIntegrity,
  deriveInvoiceStatus,
  roundMoney,
  runInTransaction,
} from '@/lib/billing';
import { logAudit } from '@/lib/audit';

const paymentSchema = z.object({
  amount: z.coerce.number().gt(0, 'Payment amount must be greater than zero'),
  paymentDate: z.string().optional(),
  paymentMethod: z.enum(['cash', 'card', 'bank', 'other'], { message: 'Invalid payment method' }),
  notes: z.string().optional().default(''),
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function serializeInvoice(invoice: any) {
  const totalAmount = Number(invoice.totalAmount ?? 0);
  const paidAmount = Number(invoice.paidAmount ?? 0);
  const remainingBalance = Math.max(totalAmount - paidAmount, 0);
  const dueDate = invoice.dueDate ? new Date(invoice.dueDate) : null;
  const today = new Date();

  let status: 'paid' | 'overdue' | 'pending' = 'pending';
  if (remainingBalance <= 0) status = 'paid';
  else if (dueDate && dueDate < today) status = 'overdue';

  return {
    ...invoice,
    _id: invoice._id.toString(),
    totalAmount,
    paidAmount,
    remainingBalance,
    status,
    patientId: invoice.patientId ? {
      _id: invoice.patientId._id?.toString?.() ?? invoice.patientId.toString(),
      fullName: invoice.patientId.fullName ?? '',
      phone: invoice.patientId.phone ?? '',
      email: invoice.patientId.email ?? '',
    } : null,
    issueDate: invoice.issueDate ? new Date(invoice.issueDate).toISOString() : null,
    dueDate: invoice.dueDate ? new Date(invoice.dueDate).toISOString() : null,
  };
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  let targetInvoiceId = '';

  try {
    const authSession = await getServerSession(authOptions);

    if (!authSession?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!authSession.user.clinicId) {
      return NextResponse.json({ error: 'No clinic associated with this account' }, { status: 403 });
    }

    if (
      authSession.user.role !== 'owner' &&
      authSession.user.role !== 'manager' &&
      authSession.user.role !== 'receptionist' &&
      authSession.user.role !== 'dentist'
    ) {
      return NextResponse.json({ error: 'You do not have permission to record payments' }, { status: 403 });
    }

    const { id } = await params;
    targetInvoiceId = id;

    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json({ error: 'Invalid invoice id' }, { status: 400 });
    }

    const body = await request.json().catch(() => null);
    const parsed = paymentSchema.safeParse(body);

    if (!parsed.success) {
      try {
        await logAudit({
          clinicId: authSession.user.clinicId,
          actorId: authSession.user.id,
          action: 'payment.failed',
          target: targetInvoiceId ? `Invoice:${targetInvoiceId}` : '',
          meta: { error: parsed.error.issues[0]?.message ?? 'Invalid payment data' },
        });
      } catch {
        // best-effort
      }

      return NextResponse.json({
        error: parsed.error.issues[0]?.message ?? 'Invalid payment data',
      }, { status: 400 });
    }

    await connectToDatabase();

    const clinicId: string = authSession.user.clinicId as string;

    const result = await runInTransaction(async (txn) => {
      const invoice = await Invoice.findOne(
        { _id: id, clinicId },
        null,
        { session: txn },
      ).populate('patientId', 'fullName phone email');

      if (!invoice) {
        throw new BillingError('Invoice not found', 404);
      }

      assertMoneyIntegrity(invoice.totalAmount, invoice.paidAmount);

      const totalAmount = roundMoney(invoice.totalAmount);
      const paidAmount = roundMoney(invoice.paidAmount);
      const remainingBalance = Math.max(totalAmount - paidAmount, 0);
      const amount = roundMoney(parsed.data.amount);

      if (amount <= 0) {
        throw new BillingError('Payment amount must be greater than zero', 400);
      }

      if (amount > remainingBalance) {
        throw new BillingError('Payment amount exceeds remaining balance', 400);
      }

      const receiptNumber = await allocateReceiptNumber(clinicId, txn);
      const paymentDate = parsed.data.paymentDate ? new Date(parsed.data.paymentDate) : new Date();

      const payment = new Payment({
        invoiceId: invoice._id,
        patientId: invoice.patientId,
        clinicId,
        amount,
        paymentDate,
        paymentMethod: parsed.data.paymentMethod,
        notes: parsed.data.notes ?? '',
        receiptNumber,
      });
      await payment.save({ session: txn });

      const updatedInvoice = await Invoice.findOneAndUpdate(
        {
          _id: id,
          clinicId,
          $expr: { $lte: [{ $add: ['$paidAmount', amount] }, '$totalAmount'] },
        },
        { $inc: { paidAmount: amount } },
        { session: txn, new: true },
      );

      if (!updatedInvoice) {
        throw new BillingError('Payment amount exceeds remaining balance', 400);
      }

      assertMoneyIntegrity(updatedInvoice.totalAmount, updatedInvoice.paidAmount);

      updatedInvoice.status = deriveInvoiceStatus(updatedInvoice);
      await updatedInvoice.save({ session: txn });

      const populatedInvoice = await Invoice.findById(id, null, { session: txn })
        .populate('patientId', 'fullName phone email')
        .lean();

      return { payment, populatedInvoice };
    });

    await logAudit({
      clinicId,
      actorId: authSession.user.id,
      action: 'payment.recorded',
      target: `Payment:${result.payment._id.toString()}`,
      meta: {
        invoiceId: id,
        invoiceNumber: result.populatedInvoice?.invoiceNumber ?? '',
        amount: roundMoney(result.payment.amount),
        receiptNumber: result.payment.receiptNumber,
        paymentMethod: result.payment.paymentMethod,
      },
    });

    return NextResponse.json({
      payment: {
        ...result.payment.toObject(),
        _id: result.payment._id.toString(),
      },
      invoice: serializeInvoice(result.populatedInvoice),
    }, { status: 201 });
  } catch (error) {
    if (error instanceof BillingError) {
      try {
        const authSession = await getServerSession(authOptions);
        if (authSession?.user?.clinicId) {
          await logAudit({
            clinicId: authSession.user.clinicId,
            actorId: authSession.user.id,
            action: 'payment.failed',
            target: targetInvoiceId ? `Invoice:${targetInvoiceId}` : '',
            meta: { error: error.message },
          });
        }
      } catch {
        // best-effort
      }
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error('POST /api/invoices/[id]/payment error:', error);
    return NextResponse.json({ error: 'Failed to record payment' }, { status: 500 });
  }
}
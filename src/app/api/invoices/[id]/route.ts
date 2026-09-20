import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db';
import { Invoice, Payment } from '@/lib/models';
import {
  BillingError,
  assertMoneyIntegrity,
  deriveInvoiceStatus,
  roundMoney,
  runInTransaction,
} from '@/lib/billing';
import { logAudit } from '@/lib/audit';

const invoicePatchSchema = z.object({
  patientId: z.string().min(1).optional(),
  dueDate: z.string().nullable().optional(),
  items: z.array(
    z.object({
      description: z.string().min(1, 'Item description is required').trim(),
      quantity: z.coerce.number().int().min(1).default(1),
      unitPrice: z.coerce.number().min(0).default(0),
      totalAmount: z.coerce.number().min(0).optional(),
      notes: z.string().optional().default(''),
    }),
  ).optional(),
  notes: z.string().optional(),
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function serializeInvoice(invoice: any) {
  const totalAmount = Number(invoice.totalAmount ?? 0);
  const paidAmount = Number(invoice.paidAmount ?? 0);
  const remainingBalance = Math.max(totalAmount - paidAmount, 0);
  const dueDate = invoice.dueDate ? new Date(invoice.dueDate) : null;
  const today = new Date();

  let status: 'paid' | 'overdue' | 'pending' = 'pending';

  if (remainingBalance <= 0) {
    status = 'paid';
  } else if (dueDate && dueDate < today) {
    status = 'overdue';
  }

  return {
    ...invoice,
    _id: invoice._id.toString(),
    totalAmount,
    paidAmount,
    remainingBalance,
    status,
    patientId: invoice.patientId
      ? {
          _id: invoice.patientId._id?.toString?.() ?? invoice.patientId.toString(),
          fullName: invoice.patientId.fullName ?? '',
          phone: invoice.patientId.phone ?? '',
          email: invoice.patientId.email ?? '',
        }
      : null,
    issueDate: invoice.issueDate ? new Date(invoice.issueDate).toISOString() : null,
    dueDate: invoice.dueDate ? new Date(invoice.dueDate).toISOString() : null,
  };
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!session.user.clinicId) {
      return NextResponse.json({ error: 'No clinic associated with this account' }, { status: 403 });
    }

    const { id } = await params;

    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json({ error: 'Invalid invoice id' }, { status: 400 });
    }

    await connectToDatabase();

    const invoice = await Invoice.findOne({
      _id: id,
      clinicId: session.user.clinicId,
    }).populate('patientId', 'fullName phone email').lean();

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    return NextResponse.json(serializeInvoice(invoice));
  } catch (error) {
    console.error('GET /api/invoices/[id] error:', error);
    return NextResponse.json({ error: 'Failed to fetch invoice' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!session.user.clinicId) {
      return NextResponse.json({ error: 'No clinic associated with this account' }, { status: 403 });
    }

    if (session.user.role !== 'owner' && session.user.role !== 'manager') {
      return NextResponse.json({ error: 'You do not have permission to update invoices' }, { status: 403 });
    }

    const { id } = await params;

    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json({ error: 'Invalid invoice id' }, { status: 400 });
    }

    const body = await request.json().catch(() => null);
    const parsed = invoicePatchSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({
        error: parsed.error.issues[0]?.message ?? 'Invalid invoice update',
      }, { status: 400 });
    }

    await connectToDatabase();

    const invoice = await Invoice.findOne({
      _id: id,
      clinicId: session.user.clinicId,
    });

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    assertMoneyIntegrity(invoice.totalAmount, invoice.paidAmount);

    if (parsed.data.patientId !== undefined && String(parsed.data.patientId) !== String(invoice.patientId)) {
      return NextResponse.json({ error: 'Cannot change the patient on an invoice' }, { status: 400 });
    }

    const paidAmount = roundMoney(invoice.paidAmount);
    const currentTotal = roundMoney(invoice.totalAmount);
    const isFullyPaid = currentTotal > 0 && paidAmount >= currentTotal;

    if (parsed.data.items) {
      if (isFullyPaid) {
        return NextResponse.json({ error: 'Cannot edit items on a fully paid invoice' }, { status: 400 });
      }

      const items = parsed.data.items.map((item) => {
        const quantity = Number(item.quantity ?? 1);
        const unitPrice = roundMoney(item.unitPrice ?? 0);
        const totalAmount = roundMoney(quantity * unitPrice);

        return {
          description: item.description,
          quantity,
          unitPrice,
          totalAmount,
          paidAmount: 0,
          status: 'pending',
          notes: item.notes ?? '',
        };
      });

      const newTotal = roundMoney(items.reduce((sum, item) => sum + Number(item.totalAmount ?? 0), 0));

      if (newTotal < paidAmount) {
        return NextResponse.json({
          error: 'Invoice total cannot be lower than the amount already paid',
        }, { status: 400 });
      }

      const updated = await Invoice.findOneAndUpdate(
        {
          _id: id,
          clinicId: session.user.clinicId,
          $expr: { $lte: ['$paidAmount', newTotal] },
        },
        { $set: { items, totalAmount: newTotal } },
        { new: true },
      );

      if (!updated) {
        return NextResponse.json({
          error: 'Invoice total cannot be lower than the amount already paid',
        }, { status: 400 });
      }
    }

    const changes: Record<string, unknown> = {};

    if (parsed.data.dueDate !== undefined) {
      changes.dueDate = parsed.data.dueDate ? new Date(parsed.data.dueDate) : null;
    }

    if (parsed.data.notes !== undefined) {
      changes.notes = parsed.data.notes;
    }

    if (Object.keys(changes).length > 0) {
      await Invoice.updateOne(
        { _id: id, clinicId: session.user.clinicId },
        { $set: changes },
      );
    }

    const fresh = await Invoice.findOne({ _id: id, clinicId: session.user.clinicId }).lean();
    if (fresh) {
      const status = deriveInvoiceStatus(fresh);
      await Invoice.updateOne({ _id: id }, { $set: { status } });
    }

    await logAudit({
      clinicId: session.user.clinicId,
      actorId: session.user.id,
      action: 'invoice.updated',
      target: `Invoice:${invoice._id.toString()}`,
      meta: { invoiceNumber: invoice.invoiceNumber },
    });

    const updatedInvoice = await Invoice.findById(invoice._id)
      .populate('patientId', 'fullName phone email')
      .lean();

    return NextResponse.json(serializeInvoice(updatedInvoice));
  } catch (error) {
    if (error instanceof BillingError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error('PATCH /api/invoices/[id] error:', error);
    return NextResponse.json({ error: 'Failed to update invoice' }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!session.user.clinicId) {
      return NextResponse.json({ error: 'No clinic associated with this account' }, { status: 403 });
    }

    if (session.user.role !== 'owner' && session.user.role !== 'manager') {
      return NextResponse.json({ error: 'You do not have permission to delete invoices' }, { status: 403 });
    }

    const { id } = await params;

    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json({ error: 'Invalid invoice id' }, { status: 400 });
    }

    await connectToDatabase();

    const invoice = await Invoice.findOne({
      _id: id,
      clinicId: session.user.clinicId,
    });

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    await runInTransaction(async (txn) => {
      const hasPayments = await Payment.countDocuments(
        { invoiceId: invoice._id, clinicId: session.user.clinicId },
        { session: txn },
      );

      if (hasPayments > 0) {
        throw new BillingError('Cannot delete an invoice that has payment history', 400);
      }

      await Invoice.deleteOne({ _id: invoice._id, clinicId: session.user.clinicId }).session(txn);
    });

    await logAudit({
      clinicId: session.user.clinicId,
      actorId: session.user.id,
      action: 'invoice.deleted',
      target: `Invoice:${invoice._id.toString()}`,
      meta: { invoiceNumber: invoice.invoiceNumber },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof BillingError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error('DELETE /api/invoices/[id] error:', error);
    return NextResponse.json({ error: 'Failed to delete invoice' }, { status: 500 });
  }
}

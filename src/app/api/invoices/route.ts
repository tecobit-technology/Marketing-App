import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db';
import { Invoice, Patient } from '@/lib/models';
import { BillingError, allocateInvoiceNumber, roundMoney, runInTransaction } from '@/lib/billing';
import { logAudit } from '@/lib/audit';

const invoiceItemSchema = z.object({
  description: z.string().min(1, 'Item description is required').trim(),
  quantity: z.coerce.number().int().min(1).default(1),
  unitPrice: z.coerce.number().min(0).default(0),
  totalAmount: z.coerce.number().min(0).optional(),
  paidAmount: z.coerce.number().min(0).optional().default(0),
  status: z.enum(['draft', 'pending', 'paid', 'overdue']).optional(),
  notes: z.string().optional().default(''),
});

const invoiceSchema = z.object({
  patientId: z.string().min(1, 'Patient is required'),
  issueDate: z.string().optional(),
  dueDate: z.string().optional().nullable(),
  items: z.array(invoiceItemSchema).min(1, 'At least one invoice item is required'),
  notes: z.string().optional().default(''),
});

function toMoney(value: number) {
  return roundMoney(value);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getInvoiceMeta(invoice: any) {
  const totalAmount = toMoney(invoice.totalAmount ?? 0);
  const paidAmount = toMoney(invoice.paidAmount ?? 0);
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
    status,
    remainingBalance,
    paidAmount,
    totalAmount,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function serializeInvoice(invoice: any) {
  const meta = getInvoiceMeta(invoice);
  const patient = invoice.patientId
    ? {
        _id: invoice.patientId._id?.toString?.() ?? invoice.patientId.toString(),
        fullName: invoice.patientId.fullName ?? '',
        phone: invoice.patientId.phone ?? '',
        email: invoice.patientId.email ?? '',
      }
    : null;

  return {
    ...invoice,
    _id: invoice._id.toString(),
    patientId: patient,
    totalAmount: meta.totalAmount,
    paidAmount: meta.paidAmount,
    remainingBalance: meta.remainingBalance,
    status: meta.status,
    issueDate: invoice.issueDate ? new Date(invoice.issueDate).toISOString() : new Date().toISOString(),
    dueDate: invoice.dueDate ? new Date(invoice.dueDate).toISOString() : null,
    items: Array.isArray(invoice.items) ? invoice.items.map((item: Record<string, unknown>) => ({
      ...item,
      quantity: Number(item.quantity ?? 1),
      unitPrice: Number(item.unitPrice ?? 0),
      totalAmount: Number(item.totalAmount ?? 0),
      paidAmount: Number(item.paidAmount ?? 0),
      notes: item.notes ?? '',
    })) : [],
  };
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!session.user.clinicId) {
      return NextResponse.json({ error: 'No clinic associated with this account' }, { status: 403 });
    }

    if (session.user.role !== 'owner' && session.user.role !== 'manager' && session.user.role !== 'dentist' && session.user.role !== 'receptionist') {
      return NextResponse.json({ error: 'You do not have permission to view invoices' }, { status: 403 });
    }

    await connectToDatabase();

    const invoices = await Invoice.find({ clinicId: session.user.clinicId })
      .populate('patientId', 'fullName phone email')
      .sort({ issueDate: -1, createdAt: -1 })
      .lean();

    return NextResponse.json(invoices.map(serializeInvoice));
  } catch (error) {
    console.error('GET /api/invoices error:', error);
    return NextResponse.json({ error: 'Failed to fetch invoices' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!session.user.clinicId) {
      return NextResponse.json({ error: 'No clinic associated with this account' }, { status: 403 });
    }

    if (session.user.role !== 'owner' && session.user.role !== 'manager') {
      return NextResponse.json({ error: 'You do not have permission to create invoices' }, { status: 403 });
    }

    const body = await request.json().catch(() => null);
    const parsed = invoiceSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({
        error: parsed.error.issues[0]?.message ?? 'Invalid invoice data',
      }, { status: 400 });
    }

    await connectToDatabase();

    const patient = await Patient.findOne({
      _id: parsed.data.patientId,
      clinicId: session.user.clinicId,
    });

    if (!patient) {
      return NextResponse.json({ error: 'Patient not found in this clinic' }, { status: 404 });
    }

    const invoice = await runInTransaction(async (txn) => {
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

      const totalAmount = roundMoney(items.reduce((sum, item) => sum + Number(item.totalAmount ?? 0), 0));
      const dueDateValue = parsed.data.dueDate ? new Date(parsed.data.dueDate) : null;
      const issueDateValue = parsed.data.issueDate ? new Date(parsed.data.issueDate) : new Date();

      const invoiceNumber = await allocateInvoiceNumber(session.user.clinicId as string, txn);

      const created = new Invoice({
        clinicId: session.user.clinicId as string,
        patientId: parsed.data.patientId,
        invoiceNumber,
        issueDate: issueDateValue,
        dueDate: dueDateValue,
        items,
        totalAmount,
        paidAmount: 0,
        status: 'pending',
        notes: parsed.data.notes ?? '',
      });
      await created.save({ session: txn });

      return created;
    });

    const populatedInvoice = await Invoice.findById(invoice._id)
      .populate('patientId', 'fullName phone email')
      .lean();

    await logAudit({
      clinicId: session.user.clinicId,
      actorId: session.user.id,
      action: 'invoice.created',
      target: `Invoice:${invoice._id.toString()}`,
      meta: {
        invoiceNumber: invoice.invoiceNumber,
        patientId: invoice.patientId.toString(),
        totalAmount: roundMoney(invoice.totalAmount),
      },
    });

    return NextResponse.json(serializeInvoice(populatedInvoice), { status: 201 });
  } catch (error) {
    if (error instanceof BillingError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error('POST /api/invoices error:', error);
    return NextResponse.json({ error: 'Failed to create invoice' }, { status: 500 });
  }
}

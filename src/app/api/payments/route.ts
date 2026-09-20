import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db';
import { Payment } from '@/lib/models';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!session.user.clinicId) {
      return NextResponse.json({ error: 'No clinic associated with this account' }, { status: 403 });
    }

    await connectToDatabase();

    const payments = await Payment.find({ clinicId: session.user.clinicId })
      .populate('invoiceId', 'invoiceNumber totalAmount paidAmount')
      .populate('patientId', 'fullName phone email')
      .sort({ paymentDate: -1, createdAt: -1 })
      .lean();

    return NextResponse.json(payments.map((payment) => {
      const invoice = payment.invoiceId as unknown as {
        _id: unknown;
        invoiceNumber?: string;
        totalAmount?: number;
        paidAmount?: number;
      } | null;
      const patient = payment.patientId as unknown as {
        _id: unknown;
        fullName?: string;
        phone?: string;
        email?: string;
      } | null;

      return {
        ...payment,
        _id: payment._id.toString(),
        invoiceId: invoice
          ? {
              _id: invoice._id == null ? '' : String(invoice._id),
              invoiceNumber: invoice.invoiceNumber ?? '',
              totalAmount: Number(invoice.totalAmount ?? 0),
              paidAmount: Number(invoice.paidAmount ?? 0),
            }
          : null,
        patientId: patient
          ? {
              _id: patient._id == null ? '' : String(patient._id),
              fullName: patient.fullName ?? '',
              phone: patient.phone ?? '',
              email: patient.email ?? '',
            }
          : null,
        amount: Number(payment.amount ?? 0),
        paymentDate: payment.paymentDate ? new Date(payment.paymentDate).toISOString() : null,
      };
    }));
  } catch (error) {
    console.error('GET /api/payments error:', error);
    return NextResponse.json({ error: 'Failed to fetch payments' }, { status: 500 });
  }
}

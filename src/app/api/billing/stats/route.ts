import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db';
import { Invoice, Payment } from '@/lib/models';

function asMoney(value: number) {
  return Number(value ?? 0);
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

    await connectToDatabase();

    const today = new Date();
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);

    const [invoices, paymentsThisMonth] = await Promise.all([
      Invoice.find({ clinicId: session.user.clinicId }).lean(),
      Payment.find({
        clinicId: session.user.clinicId,
        paymentDate: { $gte: monthStart, $lt: nextMonth },
      }).lean(),
    ]);

    const totalRevenueMTD = paymentsThisMonth.reduce((sum, payment) => sum + asMoney(payment.amount), 0);

    const invoiceStats = invoices.map((invoice) => {
      const totalAmount = asMoney(invoice.totalAmount);
      const paidAmount = asMoney(invoice.paidAmount);
      const remaining = Math.max(totalAmount - paidAmount, 0);
      const dueDate = invoice.dueDate ? new Date(invoice.dueDate) : null;
      const isOverdue = !!dueDate && dueDate < today && remaining > 0;

      return {
        totalAmount,
        paidAmount,
        remaining,
        isOverdue,
      };
    });

    const pendingPayments = invoiceStats
      .filter((invoice) => invoice.remaining > 0 && !invoice.isOverdue)
      .reduce((sum, invoice) => sum + invoice.remaining, 0);

    const outstandingOverdue = invoiceStats
      .filter((invoice) => invoice.isOverdue)
      .reduce((sum, invoice) => sum + invoice.remaining, 0);

    const totalInvoices = invoices.length;
    const paidInvoices = invoiceStats.filter((invoice) => invoice.remaining <= 0).length;
    const pendingInvoices = invoiceStats.filter((invoice) => invoice.remaining > 0 && !invoice.isOverdue).length;
    const overdueInvoices = invoiceStats.filter((invoice) => invoice.isOverdue).length;

    return NextResponse.json({
      totalRevenueMTD,
      pendingPayments,
      outstandingOverdue,
      totalInvoices,
      paidInvoices,
      pendingInvoices,
      overdueInvoices,
    });
  } catch (error) {
    console.error('GET /api/billing/stats error:', error);
    return NextResponse.json({ error: 'Failed to fetch billing stats' }, { status: 500 });
  }
}

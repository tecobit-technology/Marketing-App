import { connectToDatabase } from '@/lib/db';
import { AuditLog } from '@/lib/models';

interface AuditEntry {
  clinicId: string;
  actorId?: string | null;
  action: string;
  target?: string;
  meta?: Record<string, unknown>;
}

export async function logAudit(entry: AuditEntry): Promise<void> {
  try {
    await connectToDatabase();
    await AuditLog.create({
      clinicId: entry.clinicId,
      actorId: entry.actorId ?? null,
      action: entry.action,
      target: entry.target ?? '',
      meta: entry.meta ?? {},
    });
  } catch (error) {
    console.warn('[audit] Failed to write audit log:', error);
  }
}
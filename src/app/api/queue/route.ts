import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db';
import {
  QueueEntry,
  Patient,
  Appointment,
  type QueueEntryDoc,
} from '@/lib/models';

const queueSchema = z.object({
    patientId: z.string().min(1, 'Patient is required'),

    appointmentId: z
        .string()
        .optional()
        .nullable()
        .default(null),
});

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 },
            );
        }

        if (!session.user.clinicId) {
            return NextResponse.json(
                { error: 'No clinic associated with this account' },
                { status: 403 },
            );
        }

        await connectToDatabase();

        const queue = await QueueEntry.find({
            clinicId: session.user.clinicId,
            status: {
                $in: ['waiting', 'in-room'],
            },
        })
            .populate(
                'patientId',
                'fullName phone email',
            )
            .populate(
                'appointmentId',
                'dateTime status notes',
            )
            .sort({ joinedAt: 1 })
            .lean();

        return NextResponse.json(queue);
    } catch (error) {
        console.error('GET /api/queue error:', error);

        return NextResponse.json(
            { error: 'Failed to fetch queue' },
            { status: 500 },
        );
    }
}

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 },
            );
        }

        if (!session.user.clinicId) {
            return NextResponse.json(
                { error: 'No clinic associated with this account' },
                { status: 403 },
            );
        }

        const body = await request.json().catch(() => null);

        const parsed = queueSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                {
                    error:
                        parsed.error.issues[0]?.message ??
                        'Invalid queue data',
                },
                { status: 400 },
            );
        }

        const {
            patientId,
            appointmentId,
        } = parsed.data;

        await connectToDatabase();

        const patient = await Patient.findOne({
            _id: patientId,
            clinicId: session.user.clinicId,
        });

        if (!patient) {
            return NextResponse.json(
                {
                    error: 'Patient not found in this clinic',
                },
                { status: 404 },
            );
        }

        if (appointmentId) {
            const appointment =
                await Appointment.findOne({
                    _id: appointmentId,
                    clinicId: session.user.clinicId,
                    patientId,
                });

            if (!appointment) {
                return NextResponse.json(
                    {
                        error:
                            'Appointment not found for this patient',
                    },
                    { status: 404 },
                );
            }
        }

        // Prevent the same patient from being
        // added to the active queue twice.
        const existing = await QueueEntry.findOne({
            clinicId: session.user.clinicId,
            patientId,
            status: {
                $in: ['waiting', 'in-room'],
            },
        });

        if (existing) {
            return NextResponse.json(
                {
                    error:
                        'Patient is already in the queue',
                },
                { status: 409 },
            );
        }

        const entry = await QueueEntry.create({
            clinicId: session.user.clinicId,
            patientId,
            appointmentId: appointmentId || null,
            status: 'waiting',
            joinedAt: new Date(),
        } as unknown as QueueEntryDoc);

        const populatedEntry =
            await QueueEntry.findById(entry._id)
                .populate(
                    'patientId',
                    'fullName phone email',
                )
                .populate(
                    'appointmentId',
                    'dateTime status notes',
                )
                .lean();

        return NextResponse.json(
            populatedEntry,
            { status: 201 },
        );
    } catch (error) {
        console.error('POST /api/queue error:', error);

        return NextResponse.json(
            { error: 'Failed to add patient to queue' },
            { status: 500 },
        );
    }
}
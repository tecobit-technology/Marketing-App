import { NextResponse } from 'next/server';
import { z } from 'zod';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db';
import { ClinicalNote, Patient } from '@/lib/models';

const clinicalNoteSchema = z.object({
    patientId: z.string().min(1, 'Patient is required'),
    title: z.string().min(1, 'Title is required').max(200),
    note: z.string().min(1, 'Clinical note is required'),
});

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.clinicId) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 },
            );
        }

        await connectToDatabase();

        const notes = await ClinicalNote.find({
            clinicId: session.user.clinicId,
        })
            .populate('patientId', 'fullName phone email')
            .populate('clinicianId', 'name')
            .sort({ createdAt: -1 })
            .lean();

        return NextResponse.json(notes);
    } catch (error) {
        console.error('GET /api/clinical-notes error:', error);

        return NextResponse.json(
            { error: 'Failed to fetch clinical notes' },
            { status: 500 },
        );
    }
}

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.clinicId || !session.user.id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 },
            );
        }

        await connectToDatabase();

        const body = await request.json();
        const parsed = clinicalNoteSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                {
                    error: parsed.error.issues[0]?.message || 'Invalid data',
                },
                { status: 400 },
            );
        }

        const { patientId, title, note } = parsed.data;

        // Make sure the patient belongs to the logged-in clinic
        const patient = await Patient.findOne({
            _id: patientId,
            clinicId: session.user.clinicId,
        });

        if (!patient) {
            return NextResponse.json(
                { error: 'Patient not found' },
                { status: 404 },
            );
        }

        const clinicalNote = await ClinicalNote.create({
            patientId,
            clinicId: session.user.clinicId,
            clinicianId: session.user.id,
            title,
            note,
        });

        const populatedNote = await ClinicalNote.findById(clinicalNote._id)
            .populate('patientId', 'fullName phone email')
            .populate('clinicianId', 'name')
            .lean();

        return NextResponse.json(populatedNote, { status: 201 });
    } catch (error) {
        console.error('POST /api/clinical-notes error:', error);

        return NextResponse.json(
            { error: 'Failed to create clinical note' },
            { status: 500 },
        );
    }
}
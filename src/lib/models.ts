import mongoose, { Schema, type Model, type InferSchemaType } from 'mongoose';

export type UserRole = 'owner' | 'manager' | 'dentist' | 'receptionist';

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ['owner', 'manager', 'dentist', 'receptionist'],
      default: 'owner',
    },
    clinicId: { type: Schema.Types.ObjectId, ref: 'Clinic', default: null },
    passwordChangedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

const clinicSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    locations: [
      {
        name: String,
        address: String,
        city: String,
      },
    ],
  },
  { timestamps: true },
);

const patientSchema = new Schema(
  {
    fullName: { type: String, required: true, trim: true },
    dob: { type: Date, default: null },
    phone: { type: String, default: '' },
    email: { type: String, default: '', lowercase: true, trim: true },
    address: { type: String, default: '' },
    medicalHistory: [{ condition: String, notes: String }],
    insurance: { type: String, default: '' },
    clinicId: { type: Schema.Types.ObjectId, ref: 'Clinic', default: null },
    password: { type: String, default: null },
    passwordChangedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

const appointmentSchema = new Schema(
  {
    patientId: { type: Schema.Types.ObjectId, ref: 'Patient', required: true },
    dentistId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    clinicId: { type: Schema.Types.ObjectId, ref: 'Clinic', default: null },
    dateTime: { type: Date, required: true },
    status: {
      type: String,
      enum: ['scheduled', 'checked-in', 'in-room', 'completed', 'cancelled', 'no-show'],
      default: 'scheduled',
    },
    notes: { type: String, default: '' },
  },
  { timestamps: true },
);

const queueEntrySchema = new Schema(
  {
    clinicId: { type: Schema.Types.ObjectId, ref: 'Clinic', required: true },
    patientId: { type: Schema.Types.ObjectId, ref: 'Patient', required: true },
    status: {
      type: String,
      enum: ['waiting', 'in-room', 'completed'],
      default: 'waiting',
    },
    joinedAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

const encounterSchema = new Schema(
  {
    patientId: { type: Schema.Types.ObjectId, ref: 'Patient', required: true },
    appointmentId: { type: Schema.Types.ObjectId, ref: 'Appointment', default: null },
    clinicianId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    findings: { type: String, default: '' },
    toothChart: [{ toothNumber: Number, finding: String, status: String }],
    diagnosis: { type: String, default: '' },
    procedures: [{ code: String, description: String, toothNumber: Number }],
    notes: { type: String, default: '' },
  },
  { timestamps: true },
);

const treatmentPlanSchema = new Schema(
  {
    patientId: {
      type: Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
      index: true,
    },

    clinicId: {
      type: Schema.Types.ObjectId,
      ref: 'Clinic',
      required: true,
      index: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    status: {
      type: String,
      enum: ['draft', 'in-progress', 'accepted', 'completed'],
      default: 'draft',
    },

    items: [
      {
        procedure: {
          type: String,
          required: true,
          trim: true,
        },

        cost: {
          type: Number,
          default: 0,
          min: 0,
        },

        priority: {
          type: Number,
          default: 1,
        },
      },
    ],

    notes: {
      type: String,
      default: '',
      trim: true,
    },
  },
  { timestamps: true },
);

const invoiceItemSchema = new Schema(
  {
    description: {
      type: String,
      required: true,
      trim: true,
    },
    quantity: {
      type: Number,
      default: 1,
      min: 1,
    },
    unitPrice: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    paidAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ['draft', 'pending', 'paid', 'overdue'],
      default: 'pending',
    },
    notes: {
      type: String,
      default: '',
      trim: true,
    },
  },
  { _id: true },
);

const invoiceSchema = new Schema(
  {
    patientId: {
      type: Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
      index: true,
    },
    clinicId: {
      type: Schema.Types.ObjectId,
      ref: 'Clinic',
      required: true,
      index: true,
    },
    invoiceNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    issueDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    dueDate: {
      type: Date,
      default: null,
    },
    items: [invoiceItemSchema],
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    paidAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ['draft', 'pending', 'paid', 'overdue'],
      default: 'pending',
      index: true,
    },
    notes: {
      type: String,
      default: '',
      trim: true,
    },
  },
  { timestamps: true },
);

const paymentSchema = new Schema(
  {
    invoiceId: {
      type: Schema.Types.ObjectId,
      ref: 'Invoice',
      required: true,
      index: true,
    },
    patientId: {
      type: Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
      index: true,
    },
    clinicId: {
      type: Schema.Types.ObjectId,
      ref: 'Clinic',
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    paymentDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'card', 'bank', 'other'],
      required: true,
    },
    notes: {
      type: String,
      default: '',
      trim: true,
    },
    receiptNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
  },
  { timestamps: true },
);

const clinicalNoteSchema = new Schema(
  {
    patientId: {
      type: Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
      index: true,
    },

    clinicId: {
      type: Schema.Types.ObjectId,
      ref: 'Clinic',
      required: true,
      index: true,
    },

    clinicianId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    note: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true },
);

const counterSchema = new Schema(
  {
    clinicId: {
      type: Schema.Types.ObjectId,
      ref: 'Clinic',
      required: true,
    },
    key: {
      type: String,
      required: true,
    },
    seq: {
      type: Number,
      required: true,
      default: 1000,
    },
  },
  { timestamps: true },
);

counterSchema.index({ clinicId: 1, key: 1 }, { unique: true });

const auditLogSchema = new Schema(
  {
    clinicId: {
      type: Schema.Types.ObjectId,
      ref: 'Clinic',
      required: true,
      index: true,
    },
    actorId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    action: { type: String, required: true },
    target: { type: String, default: '' },
    meta: { type: Object, default: {} },
  },
  { timestamps: true },
);

const contactMessageSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, default: '' },
    subject: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
  },
  { timestamps: true },
);

const platformAdminSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, default: 'admin' },
    isActive: { type: Boolean, default: true },
    passwordChangedAt: { type: Date, default: null },
    lastLoginAt: { type: Date, default: null },
  },
  { timestamps: true },
);

const passwordResetTokenSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    tokenHash: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true },
);

type UserDoc = InferSchemaType<typeof userSchema>;
type PatientDoc = InferSchemaType<typeof patientSchema> & {
  password?: string | null;
  passwordChangedAt?: Date | null;
};
type AppointmentDoc = InferSchemaType<typeof appointmentSchema>;
type ClinicDoc = InferSchemaType<typeof clinicSchema>;
type EncounterDoc = InferSchemaType<typeof encounterSchema>;
type TreatmentPlanDoc = InferSchemaType<typeof treatmentPlanSchema>;
type InvoiceItemDoc = InferSchemaType<typeof invoiceItemSchema>;
type InvoiceDoc = InferSchemaType<typeof invoiceSchema>;
type PaymentDoc = InferSchemaType<typeof paymentSchema>;
type ClinicalNoteDoc = InferSchemaType<typeof clinicalNoteSchema>;
type CounterDoc = InferSchemaType<typeof counterSchema>;
type QueueEntryDoc = InferSchemaType<typeof queueEntrySchema> & {
  calledAt?: Date | null;
  completedAt?: Date | null;
};
type AuditLogDoc = InferSchemaType<typeof auditLogSchema>;
type ContactMessageDoc = InferSchemaType<typeof contactMessageSchema>;
type PlatformAdminDoc = InferSchemaType<typeof platformAdminSchema>;
type PasswordResetTokenDoc = InferSchemaType<typeof passwordResetTokenSchema>;

function model<T>(name: string, schema: Schema): Model<T> {
  return (mongoose.models[name] as Model<T> | undefined) ??
    mongoose.model<T>(name, schema);
}

export const User = model<UserDoc>('User', userSchema);
export const Clinic = model<ClinicDoc>('Clinic', clinicSchema);
export const Patient = model<PatientDoc>('Patient', patientSchema);
export const Appointment = model<AppointmentDoc>('Appointment', appointmentSchema);
export const QueueEntry = model<QueueEntryDoc>('QueueEntry', queueEntrySchema);
export const Encounter = model<EncounterDoc>('Encounter', encounterSchema);
export const TreatmentPlan = model<TreatmentPlanDoc>('TreatmentPlan', treatmentPlanSchema);
export const Invoice = model<InvoiceDoc>('Invoice', invoiceSchema);
export const Payment = model<PaymentDoc>('Payment', paymentSchema);
export const Counter = model<CounterDoc>('Counter', counterSchema);
export const ClinicalNote = model<ClinicalNoteDoc>('ClinicalNote', clinicalNoteSchema);
export const AuditLog = model<AuditLogDoc>('AuditLog', auditLogSchema);
export const ContactMessage = model<ContactMessageDoc>('ContactMessage', contactMessageSchema);
export const PlatformAdmin = model<PlatformAdminDoc>('PlatformAdmin', platformAdminSchema);
export const PasswordResetToken = model<PasswordResetTokenDoc>(
  'PasswordResetToken',
  passwordResetTokenSchema,
);

export type {
  UserDoc,
  PatientDoc,
  AppointmentDoc,
  ClinicDoc,
  EncounterDoc,
  TreatmentPlanDoc,
  InvoiceItemDoc,
  InvoiceDoc,
  PaymentDoc,
  CounterDoc,
  ClinicalNoteDoc,
  QueueEntryDoc,
  AuditLogDoc,
  ContactMessageDoc,
  PlatformAdminDoc,
  PasswordResetTokenDoc,
};

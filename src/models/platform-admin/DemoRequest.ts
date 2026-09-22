import mongoose, { Schema, Document, Model } from "mongoose";

export interface IDemoRequest extends Document {
  userId: mongoose.Types.ObjectId;

  name: string;
  email: string;
  phone: string;
  company: string;
  clinicSize: string;

  leadId?: mongoose.Types.ObjectId;

  preferredDate: Date;
  preferredTime: string;

  status:
    | "Requested"
    | "Confirmed"
    | "Completed"
    | "Cancelled"
    | "No Show";

  notes?: string;

  createdAt: Date;
  updatedAt: Date;
}

const demoRequestSchema = new Schema<IDemoRequest>(
  {
    // Authenticated customer who submitted this request
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    company: {
      type: String,
      required: true,
      trim: true,
    },

    clinicSize: {
      type: String,
      required: true,
      trim: true,
    },

    leadId: {
      type: Schema.Types.ObjectId,
      ref: "Lead",
      required: false,
    },

    preferredDate: {
      type: Date,
      required: true,
    },

    preferredTime: {
      type: String,
      required: true,
      trim: true,
    },

    status: {
      type: String,
      enum: [
        "Requested",
        "Confirmed",
        "Completed",
        "Cancelled",
        "No Show",
      ],
      default: "Requested",
      required: true,
    },

    notes: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export const DemoRequest: Model<IDemoRequest> =
  mongoose.models.DemoRequest ||
  mongoose.model<IDemoRequest>("DemoRequest", demoRequestSchema);
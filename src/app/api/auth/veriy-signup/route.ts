import { NextResponse } from "next/server";
import { z } from "zod";
import crypto from "crypto";

import { connectToDatabase } from "@/lib/db";
import { SignupOtp, User } from "@/lib/models";

const verifySchema = z.object({
  email: z
    .string()
    .trim()
    .email()
    .transform((email) => email.toLowerCase()),

  otp: z
    .string()
    .regex(/^\d{6}$/, "Enter the 6-digit verification code."),
});

function hashOtp(otp: string) {
  return crypto
    .createHash("sha256")
    .update(otp)
    .digest("hex");
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const parsed = verifySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error:
            parsed.error.issues[0]?.message ??
            "Invalid verification code.",
        },
        { status: 400 },
      );
    }

    const { email, otp } = parsed.data;

    await connectToDatabase();

    const pendingSignup = await SignupOtp.findOne({
      email,
    });

    if (!pendingSignup) {
      return NextResponse.json(
        {
          error:
            "Verification code expired or not found. Please sign up again.",
        },
        { status: 404 },
      );
    }

    if (pendingSignup.expiresAt.getTime() < Date.now()) {
      await SignupOtp.deleteOne({
        _id: pendingSignup._id,
      });

      return NextResponse.json(
        {
          error:
            "Verification code has expired. Please sign up again.",
        },
        { status: 400 },
      );
    }

    if (pendingSignup.attempts >= 5) {
      await SignupOtp.deleteOne({
        _id: pendingSignup._id,
      });

      return NextResponse.json(
        {
          error:
            "Too many incorrect attempts. Please sign up again.",
        },
        { status: 429 },
      );
    }

    const validOtp =
      hashOtp(otp) === pendingSignup.otpHash;

    if (!validOtp) {
      pendingSignup.attempts += 1;
      await pendingSignup.save();

      return NextResponse.json(
        {
          error: "Incorrect verification code.",
        },
        { status: 400 },
      );
    }

    // Double-check email hasn't been registered
    // while the OTP was pending.
    const existingUser = await User.findOne({
      email,
    });

    if (existingUser) {
      await SignupOtp.deleteOne({
        _id: pendingSignup._id,
      });

      return NextResponse.json(
        {
          error:
            "An account with this email already exists.",
        },
        { status: 409 },
      );
    }

    const user = await User.create({
      name: pendingSignup.name,
      email: pendingSignup.email,
      passwordHash: pendingSignup.passwordHash,
      role: "owner",

      // Important:
      // No clinic is created.
      clinicId: null,

      emailVerified: new Date(),
      passwordChangedAt: new Date(),
    });

    await SignupOtp.deleteOne({
      _id: pendingSignup._id,
    });

    return NextResponse.json(
      {
        message:
          "Email verified and account created successfully.",
        id: user._id.toString(),
        name: user.name,
        email: user.email,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error(
      "VERIFY_SIGNUP_ERROR:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Unable to verify your email. Please try again.",
      },
      { status: 500 },
    );
  }
}
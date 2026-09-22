import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import crypto from "crypto";

import { connectToDatabase } from "@/lib/db";
import { User, SignupOtp } from "@/lib/models";
import { strongPassword } from "@/lib/validations";
import { sendSignupOtpEmail } from "@/lib/email";

const registerSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Name must be at least 2 characters")
      .max(100, "Name is too long"),

    email: z
      .string()
      .trim()
      .email("Enter a valid email")
      .transform((email) => email.toLowerCase()),

    password: strongPassword,

    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

function generateOtp() {
  return crypto.randomInt(100000, 1000000).toString();
}

function hashOtp(otp: string) {
  return crypto
    .createHash("sha256")
    .update(otp)
    .digest("hex");
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);

    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error:
            parsed.error.issues[0]?.message ??
            "Invalid input",
        },
        { status: 400 },
      );
    }

    const {
      name,
      email,
      password,
    } = parsed.data;

    await connectToDatabase();

    // Existing verified account
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return NextResponse.json(
        {
          error: "An account with this email already exists.",
        },
        { status: 409 },
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const otp = generateOtp();
    const otpHash = hashOtp(otp);

    const expiresAt = new Date(
      Date.now() + 10 * 60 * 1000,
    );

    // Remove previous pending signup
    await SignupOtp.deleteMany({ email });

    await SignupOtp.create({
      name,
      email,
      passwordHash,
      otpHash,
      expiresAt,
      attempts: 0,
    });

    try {
      await sendSignupOtpEmail(email, otp);
    } catch (emailError) {
      console.error(
        "SIGNUP_OTP_EMAIL_ERROR:",
        emailError,
      );

      await SignupOtp.deleteMany({ email });

      return NextResponse.json(
        {
          error:
            "Unable to send verification email. Please try again.",
        },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        message:
          "Verification code sent to your email.",
        email,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("REGISTER_ERROR:", error);

    return NextResponse.json(
      {
        error:
          "Unable to start registration. Please try again.",
      },
      { status: 500 },
    );
  }
}
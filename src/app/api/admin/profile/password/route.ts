import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import bcrypt from "bcryptjs";
import { z } from "zod";

import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/lib/models";
import { strongPassword } from "@/lib/validations";

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: strongPassword,
    confirmPassword: z.string().min(1, "Confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "New password and confirmation do not match",
    path: ["confirmPassword"],
  });

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    if (!userId) {
      return NextResponse.json({ message: "User session is invalid" }, { status: 400 });
    }

    const body = await request.json().catch(() => null);
    const parsed = passwordSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.issues[0]?.message ?? "Invalid password data" },
        { status: 400 },
      );
    }

    await connectToDatabase();

    const user = await User.findById(userId).select("+passwordHash");

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const isCurrentPasswordValid = await bcrypt.compare(parsed.data.currentPassword, user.passwordHash);

    if (!isCurrentPasswordValid) {
      return NextResponse.json({ message: "Current password is incorrect" }, { status: 401 });
    }

    const newPasswordHash = await bcrypt.hash(parsed.data.newPassword, 12);

    user.passwordHash = newPasswordHash;
    user.passwordChangedAt = new Date();
    await user.save();

    return NextResponse.json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Admin password change error:", error);
    return NextResponse.json({ message: "Failed to update password" }, { status: 500 });
  }
}

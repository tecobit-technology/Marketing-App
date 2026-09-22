import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";

import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/lib/models";

const profileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must contain at least 2 characters")
    .max(100, "Name is too long")
    .optional(),
});

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    if (!userId) {
      return NextResponse.json({ message: "User session is invalid" }, { status: 400 });
    }

    await connectToDatabase();

    const user = await User.findById(userId).select("name email role clinicId").lean();

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      clinicId: user.clinicId ? user.clinicId.toString() : null,
    });
  } catch (error) {
    console.error("Admin profile GET error:", error);
    return NextResponse.json({ message: "Failed to load profile" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
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
    const parsed = profileSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.issues[0]?.message ?? "Invalid profile data" },
        { status: 400 },
      );
    }

    if (!parsed.data.name) {
      return NextResponse.json({ message: "Name is required" }, { status: 400 });
    }

    await connectToDatabase();

    const user = await User.findById(userId);

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    user.name = parsed.data.name.trim();
    await user.save();

    return NextResponse.json({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      clinicId: user.clinicId ? user.clinicId.toString() : null,
    });
  } catch (error) {
    console.error("Admin profile PATCH error:", error);
    return NextResponse.json({ message: "Failed to update profile" }, { status: 500 });
  }
}

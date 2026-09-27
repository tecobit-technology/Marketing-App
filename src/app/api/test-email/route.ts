import { NextResponse } from "next/server";
import { sendDemoRequestEmail } from "@/lib/email";

export async function GET() {
  try {
    await sendDemoRequestEmail({
      name: "Test User",
      email: "test@example.com",
      phone: "9800000000",
      company: "Test Dental Clinic",
      clinicSize: "1-5",
      preferredDate: new Date().toISOString(),
      preferredTime: "10:00 AM",
    });

    return NextResponse.json({
      success: true,
      message: "Test email sent successfully.",
    });
  } catch (error) {
    console.error("TEST EMAIL ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to send test email.",
      },
      { status: 500 }
    );
  }
}
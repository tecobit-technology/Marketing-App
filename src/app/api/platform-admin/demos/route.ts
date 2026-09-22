import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { connectToDatabase } from "@/lib/db";
import { authOptions } from "@/lib/auth";
import { DemoRequest } from "@/models/platform-admin/DemoRequest";
import { Lead } from "@/models/platform-admin/Leads";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    // Only Platform Admin can view all demo requests
    if (session?.user?.role !== "platform_admin") {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized.",
        },
        { status: 401 }
      );
    }

    await connectToDatabase();

    const demos = await DemoRequest.find({})
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      data: demos,
    });
  } catch (error) {
    console.error("Failed to fetch demo requests:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch demo requests",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    // --------------------------------------------------
    // 1. Verify authenticated user
    // --------------------------------------------------

    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          message: "You must be signed in to schedule a demo.",
        },
        { status: 401 }
      );
    }

    // Platform admin should not create customer demo requests
    if (session.user.role === "platform_admin") {
      return NextResponse.json(
        {
          success: false,
          message: "Platform admins cannot submit customer demo requests.",
        },
        { status: 403 }
      );
    }

    await connectToDatabase();

    const body = await request.json();

    const {
      phone,
      company,
      clinicSize,
      preferredDate,
      preferredTime,
      notes,
    } = body;

    // --------------------------------------------------
    // 2. Validate customer-provided fields
    // --------------------------------------------------

    if (
      !phone ||
      !company ||
      !clinicSize ||
      !preferredDate ||
      !preferredTime
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "All required fields must be provided.",
        },
        { status: 400 }
      );
    }

    // --------------------------------------------------
    // 3. Get identity from authenticated session
    // --------------------------------------------------

    const userId = session.user.id;

    const name = session.user.name?.trim();

    const email = session.user.email?.toLowerCase().trim();

    if (!name || !email) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Your account is missing required profile information.",
        },
        { status: 400 }
      );
    }

    // --------------------------------------------------
    // 4. Validate preferred date
    // --------------------------------------------------

    const demoDate = new Date(preferredDate);

    if (Number.isNaN(demoDate.getTime())) {
      return NextResponse.json(
        {
          success: false,
          message: "Please provide a valid demo date.",
        },
        { status: 400 }
      );
    }

    // --------------------------------------------------
    // 5. Find existing Lead by authenticated email
    // --------------------------------------------------

    let lead = await Lead.findOne({
      email,
    });

    // --------------------------------------------------
    // 6. Create Lead if it doesn't exist
    // --------------------------------------------------

    if (!lead) {
      lead = await Lead.create({
        name,
        email,
        phone,
        company,
        clinicSize,
        source: "Website",
        status: "New",
        notes: notes || "",
      });
    }

    // --------------------------------------------------
    // 7. Create Demo Request
    // --------------------------------------------------

    const demoRequest = await DemoRequest.create({
      userId,

      // These come from the authenticated account
      name,
      email,

      // These come from the demo form
      phone,
      company,
      clinicSize,
      preferredDate: demoDate,
      preferredTime,
      notes: notes || "",

      leadId: lead._id,

      // Every new request starts as Requested
      status: "Requested",
    });

    return NextResponse.json(
      {
        success: true,
        message: "Demo request submitted successfully.",
        data: demoRequest,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Demo request POST error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create demo request.",
      },
      { status: 500 }
    );
  }
}
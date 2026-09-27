import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { DemoRequest } from "@/models/platform-admin/DemoRequest";
import { Lead } from "@/models/platform-admin/Leads";
import { sendDemoRequestEmail } from "@/lib/email";

// GET demo requests
// Kept for compatibility. Platform Admin should normally use
// /api/platform-admin/demos for managing demo requests.
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized.",
        },
        { status: 401 }
      );
    }

    await connectToDatabase();

    const demos = await DemoRequest.find({
      userId: session.user.id,
    })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(
      {
        success: true,
        data: demos,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching demo requests:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch demo requests.",
      },
      { status: 500 }
    );
  }
}

// CREATE demo request
export async function POST(request: Request) {
  try {
    // --------------------------------------------------
    // 1. Verify normal mySaaS user session
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

    // --------------------------------------------------
    // 2. Connect to database
    // --------------------------------------------------

    await connectToDatabase();

    // --------------------------------------------------
    // 3. Read request body
    // --------------------------------------------------

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
    // 4. Validate required fields
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
    // 5. Get authenticated user information
    // --------------------------------------------------

    const userId = session.user.id;

    const name = session.user.name?.trim();
    const email = session.user.email?.toLowerCase().trim();

    if (!name || !email) {
      return NextResponse.json(
        {
          success: false,
          message: "Your account is missing required profile information.",
        },
        { status: 400 }
      );
    }

    // --------------------------------------------------
    // 6. Validate preferred date
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
    // 7. Find or create Lead
    // --------------------------------------------------

    let lead = await Lead.findOne({ email });

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
    } else {
      // Keep existing lead information up to date.
      lead.name = name;
      lead.phone = phone;
      lead.company = company;
      lead.clinicSize = clinicSize;

      if (notes) {
        lead.notes = notes;
      }

      await lead.save();
    }

    // --------------------------------------------------
    // 8. Create Demo Request
    // --------------------------------------------------

    const demoRequest = await DemoRequest.create({
      userId,
      name,
      email,
      phone,
      company,
      clinicSize,
      preferredDate: demoDate,
      preferredTime,
      notes: notes || "",
      leadId: lead._id,
      status: "Requested",
    });

    // --------------------------------------------------
    // 9. Send email notification
    // --------------------------------------------------

    try {
      await sendDemoRequestEmail({
        name,
        email,
        phone,
        company,
        clinicSize,
        preferredDate: demoDate.toISOString(),
        preferredTime,
      });

      console.log("Demo request email sent successfully.");
    } catch (emailError) {
      // Demo request has already been created.
      // Email failure should not make the request fail.
      console.error(
        "Demo request created, but email notification failed:",
        emailError
      );
    }

    // --------------------------------------------------
    // 10. Return success
    // --------------------------------------------------

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

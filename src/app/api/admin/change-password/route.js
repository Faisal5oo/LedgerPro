import { NextResponse } from "next/server";
import dbConnect from "../../../../lib/dbConnect";
import Admin from "../../../../models/Submission";
import bcrypt from "bcryptjs";

export async function PUT(req) {
  await dbConnect();

  try {
    // Get request body
    const body = await req.json();
    const { currentPassword, newPassword, adminId } = body;

    console.log("Request body:", { currentPassword: !!currentPassword, newPassword: !!newPassword, adminId });

    // Validate input
    if (!currentPassword || !newPassword || !adminId) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Find admin by ID
    const admin = await Admin.findById(adminId);
    if (!admin) {
      return NextResponse.json(
        { message: "Admin not found" },
        { status: 404 }
      );
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, admin.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { message: "Current password is incorrect" },
        { status: 401 }
      );
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update admin password
    admin.password = hashedPassword;
    await admin.save();

    return NextResponse.json(
      { message: "Password updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Password change error:", error);
    return NextResponse.json(
      { message: "Internal server error", error: error.message },
      { status: 500 }
    );
  }
} 
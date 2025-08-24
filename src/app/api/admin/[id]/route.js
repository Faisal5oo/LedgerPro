// /app/api/admin/[id]/route.ts
import { NextResponse } from "next/server";
import dbConnect from "../../../../lib/dbConnect";
import Admin from "../../../../models/Submission"; // adjust path accordingly

export async function GET(req, { params }) {
  try {
    await dbConnect();
    const { id } = params;

    const admin = await Admin.findById(id).select("-password"); // don't return password
    if (!admin) {
      return NextResponse.json({ error: "Admin not found" }, { status: 404 });
    }

    return NextResponse.json(admin);
  } catch (error) {
    console.error("Get admin error:", error);
    return NextResponse.json({ error: "Failed to fetch admin details" }, { status: 500 });
  }
}

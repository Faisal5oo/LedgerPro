import { NextResponse } from "next/server";
import dbConnect from "../../../../../lib/dbConnect";
import Admin, { Submission, Employee } from "../../../../../models/Submission";

export async function GET(req, { params }) {
  await dbConnect();

  try {
    const { id } = params;
    
    // Verify if admin exists
    const admin = await Admin.findById(id);
    if (!admin) {
      return NextResponse.json(
        { error: "Admin not found" },
        { status: 404 }
      );
    }

    // Find all submissions where the empRef is the admin's id and admin flag is true
    // This ensures we only get submissions specifically made through admin's referral link
    const submissions = await Submission.find({ empRef: id, admin: true });
    
    console.log(`Found ${submissions.length} admin submissions for admin ID: ${id}`);

    // Format the response
    const formattedSubmissions = await Promise.all(
      submissions.map(async (submission) => {
        return {
          id: submission._id,
          adminId: id,
          videoURL: submission.videoURL,
          title: submission.title || "",
          creatorName: `${submission.firstName} ${submission.lastName}`,
          email: submission.email,
          createdAt: submission.createdAt,
          updatedAt: submission.updatedAt,
        };
      })
    );

    return NextResponse.json(formattedSubmissions, { status: 200 });
  } catch (error) {
    console.error("GET admin videos error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
} 
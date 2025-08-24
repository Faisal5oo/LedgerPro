import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import Admin from '@/models/Admin';
import dbConnect from '@/lib/dbConnect';

export async function POST(req) {
  try {
    await dbConnect();

    // Get total admin count
    const adminCount = await Admin.countDocuments();
    if (adminCount >= 2) {
      return NextResponse.json(
        { error: "Maximum number of admins (2) already reached" },
        { status: 403 }
      );
    }

    const { email, password } = await req.json();

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return NextResponse.json(
        { error: "Admin already exists with this email" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new admin
    const admin = new Admin({
      email,
      password: hashedPassword,
    });

    await admin.save();

    return NextResponse.json(
      { message: "Admin registered successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Admin registration error:", error);
    return NextResponse.json(
      { error: "Error registering admin" },
      { status: 500 }
    );
  }
}

import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';
import Admin from '../../../../models/Submission'; // Or your actual model name
import dbConnect from "../../../../lib/dbConnect";

export async function POST(req) {
  try {
    await dbConnect(); // 👈 Ensures MongoDB is connected

    const { email, password } = await req.json();
    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = new Admin({
      email,
      password: hashedPassword,
    });

    admin.formLink = `https://www.clipsflick.com/submit-video/${admin._id}`;
    await admin.save();

    return NextResponse.json({ message: "Admin registered", formLink: admin.formLink }, { status: 201 });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: "Error registering admin" }, { status: 500 });
  }
}

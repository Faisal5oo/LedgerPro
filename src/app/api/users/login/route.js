import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";
import Admin from "../../../../models/Admin"; // Use the correct Admin model
import dbConnect from "../../../../lib/dbConnect";

const JWT_SECRET = process.env.JWT_SECRET || "your-fallback-secret";

export async function POST(req) {
  try {
    await dbConnect();

    const { email, password } = await req.json();

    // 1. Check if Admin exists
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return NextResponse.json(
        { error: "Admin not found" },
        { status: 404 }
      );
    }

    // 2. Compare passwords
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // 3. Generate token
    const token = jwt.sign({ id: admin._id, email: admin.email }, JWT_SECRET, {
      expiresIn: "1d",
    });

    // 4. Set cookie with token
    const response = NextResponse.json(
      {
        message: "Login successful",
        token: token, // Return token to frontend
        email: admin.email,
        formLink: admin.formLink,
      },
      { status: 200 }
    );

    response.cookies.set({
      name: "token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 1,
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

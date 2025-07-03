import { NextRequest, NextResponse } from "next/server";
// Update the import path below to the correct relative path if needed
import { getConnection, UserModel } from "../../middleware/user";
import type { Model } from "mongoose";  
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Basic validation
    if (!body.email || !body.password) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    if (typeof body.email !== "string" || typeof body.password !== "string") {
      return NextResponse.json({ message: "Invalid data types" }, { status: 400 });
    }

    console.log("Request body:", body);
    await getConnection();

    // Check if user exists
    const user = await (UserModel as Model<any>).findOne({ email: body.email });
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(body.password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json({ message: "Invalid password" }, { status: 401 });
    }

// Return success response with user data (excluding password)
const { password, ...userData } = user.toObject();

// Set a session cookie that expires in 30 days
// You need to generate a sessionToken here (implement your session logic)
const sessionToken = "GENERATE_SESSION_TOKEN_HERE"; // Replace with actual session token generation logic

const response = NextResponse.json({ message: "Login successful", user: userData }, { status: 200 });
response.cookies.set("session", sessionToken, {
  httpOnly: true,
  path: "/",
  maxAge: 60 * 60 * 24 * 7, // 1 week
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
});
return response;
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
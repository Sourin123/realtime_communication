import { NextRequest, NextResponse } from "next/server";
import { getConnection, UserModel } from "../../middleware/user";
import type { Model } from "mongoose";
import bcrypt from "bcryptjs";

/**
 * Handles user signup via POST request.
 *
 * This function performs the following steps:
 * 1. Parses and validates the request body for required fields (`username`, `email`, `password`).
 * 2. Validates the email format and data types of the input fields.
 * 3. Checks if a user with the given username or email already exists in the database.
 * 4. Hashes the user's password using bcrypt.
 * 5. Creates and saves a new user document in the database.
 * 6. Stores the user's ID in localStorage (client-side).
 * 7. Sets a `userId` cookie with a 30-day expiration.
 * 8. Returns a JSON response indicating the result of the signup process.
 *
 * @param req - The incoming Next.js request object containing the signup data in JSON format.
 * @returns A NextResponse object with a JSON payload and appropriate HTTP status code.
 *
 * @remarks
 * - Returns `400` if required fields are missing or invalid.
 * - Returns `409` if a user with the same username or email already exists.
 * - Returns `200` on successful signup.
 * - Returns `500` if a server error occurs.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Basic validation
    if (!body.username || !body.email || !body.password) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }
    // Check email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return NextResponse.json({ message: "Invalid email format" }, { status: 400 });
    }
    if (
      typeof body.username !== "string" ||
      typeof body.email !== "string" ||
      typeof body.password !== "string"
    ) {
      return NextResponse.json({ message: "Invalid data types" }, { status: 400 });
    }

    console.log("Request body:", body);
    await getConnection();

    // Check if user already exists (by username or email)
    const existing = await (UserModel as Model<any>).findOne({
      $or: [{ name: body.username }, { email: body.email }],
    });
    if (existing) {
      return NextResponse.json({ message: "User already exists", showPopup: true }, { status: 409 });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(body.password, 10);

    // Create new user
    const user = new UserModel({
      name: body.username, // Map username to name
      email: body.email,
      password: hashedPassword,
      phoneNumber: body.phoneNumber || "",
      profilePictureUrl: body.profilePictureUrl || "",
      verificationToken: "",
      isVerified: false,
      type: "user",
      createdAt: new Date(),
    });
    await user.save();


    localStorage.setItem("userId", user._id.toString()); // Store userId in localStorage


    const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days from now

    const response = NextResponse.json({ message: "Signup successful" }, { status: 200 });
    response.cookies.set("userId", user._id.toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/chat",
      expires,
    });
    return response;
  } catch (error) {
    console.log(error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
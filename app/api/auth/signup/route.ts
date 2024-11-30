import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  return NextResponse.json(
    { message: "GET request successfully to auth/signup" },
    { status: 200 }
  );
}

export async function POST(req: Request) {
  try {
    // Parse the request body
    console.log("Hello 123");
    const { name, email, password } = await req.json();

    const exist = await db.user.findUnique({
      where: { email }, 
    });

    if (exist) {
      return NextResponse.json(
        { success: false, message: "User already exists" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the new user
    const user = await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    console.log("User created:", user);

    return NextResponse.json(
      { message: "User created successfully", user },
      { status: 200 }
    );
  } catch (err) {
    console.error(err);
    const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
    return NextResponse.json(
      { message: "Internal server error", error: errorMessage },
      { status: 500 }
    );
  }
}

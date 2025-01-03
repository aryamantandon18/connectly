import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { createCanvas } from 'canvas';
import { v4 as uuidv4 } from 'uuid';
import cloudinary from "@/lib/cloudinary";

export async function GET(req: Request) {
  return NextResponse.json(
    { message: "GET request successfully to auth/signup" },
    { status: 200 }
  );
}

// Helper function to generate profile image
function generateProfileImage(initial: string,userIdentifier: string): Buffer {
  const canvas = createCanvas(200, 200); // Create a 200x200 canvas
  const ctx = canvas.getContext('2d');

  // Predefined colors
  const colors = ['#4F46E5', '#F87171', '#34D399', '#FBBF24', '#60A5FA', '#A78BFA', '#F472B6'];

  // Generate color index based on user identifier hash
  const hash = userIdentifier.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const color = colors[hash % colors.length];
  ctx.fillRect(0, 0, 200, 200);

  // Text style
  ctx.font = 'bold 100px Arial';
  ctx.fillStyle = '#FFFFFF'; // White text
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Add initial to the center
  ctx.fillText(initial, 100, 100);

  // Return buffer
  return canvas.toBuffer('image/png');
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

    const initial = name.charAt(0).toUpperCase();
    const imageBuffer = generateProfileImage(initial,email);

        // Upload profile image to Cloudinary
        const uploadedImage = await new Promise<any>((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              folder: 'profile_pictures',
              public_id: uuidv4(),
              resource_type: 'image',
            },
            (error, result) => {
              if (error) {
                console.error("Cloudinary upload error:", error);
                reject(new Error('Failed to upload image to Cloudinary'));
              } else {
                resolve(result);
              }
            }
          );
    
          uploadStream.end(imageBuffer);
        });
    

    const hashedPassword = await bcrypt.hash(password, 10);
    // Create the new user
    const user = await db.user.create({
      data: {
        email,
        password: hashedPassword,
        profile: {  // Creating associated profile at the same time
          create: { 
            name: name, 
            email:email,
            imageUrl:uploadedImage.secure_url,
          },
        },
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

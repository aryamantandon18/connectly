import { v4 as uuidv4 } from "uuid";
import { currentProfile } from "@/lib/current-profile";

import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { MemberRole } from "@prisma/client";
import cloudinary from "@/lib/cloudinary";


export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    // console.log("Line 13 ",formData);
    const imageFiles = formData.getAll('imageUrl') as File[];
    // console.log("Line 15 ", imageFiles);
    const name = formData.get('name')?.toString();

    if (!name || imageFiles.length === 0) {
        return new NextResponse("Invalid data", { status: 400 });
      }

    const profile = await currentProfile();
    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const imageFile = imageFiles[0];
    const buffer = Buffer.from(await imageFile.arrayBuffer());

    // Upload the image to Cloudinary using the upload_stream
    const uploadedImage = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: "servers", // Specify your Cloudinary folder
          resource_type: "auto", // Automatically detect image type (jpeg, png, etc.)
        },
        (error, result) => {
          if (error) {
            reject(new Error("Cloudinary upload failed"));
          } else {
            resolve(result);
          }
        }
      ).end(buffer);
    });

    const server = await db.server.create({
      data: {
        name,
        imageUrl:uploadedImage.secure_url,
        inviteCode: uuidv4(),
        profileId: profile.id,
        channels: {
          create: [
            {
              name: "general",
              profileId: profile.id,
            },
          ],
        },
        members: {
          create: [
            {
              profileId: profile.id,
              role: MemberRole.ADMIN,
            },
          ],
        },
      },
    });

    return NextResponse.json(server, {status: 201,});
  } catch (error) {
    console.log("[SERVER_POST]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

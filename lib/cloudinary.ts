import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
})


// Handles both browser File and Node.js formidable.File
export const uploadToCloudinary = async (
  file: File | { filepath: string },
  folder: string = "discord-clone"
) => {
  try {
    let buffer: Buffer;

    if (file instanceof File) {
      // Browser File
      const arrayBuffer = await file.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);
    } else if ("filepath" in file) {
      // Node.js formidable.File
      buffer = await fs.promises.readFile(file.filepath);
    } else {
      throw new Error("Unsupported file type for Cloudinary upload");
    }

    return new Promise<any>((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { folder, resource_type: "auto" },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(buffer);
    });
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    throw new Error("File upload failed");
  }
};

export const isCloudinaryConfigured = () =>
  !!process.env.CLOUDINARY_CLOUD_NAME &&
  !!process.env.CLOUDINARY_API_KEY &&
  !!process.env.CLOUDINARY_API_SECRET;


export default cloudinary;
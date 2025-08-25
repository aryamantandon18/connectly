import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { db } from "@/lib/db";
import { uploadToCloudinary } from "@/lib/cloudinary";
import multer from "multer";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// Configure multer
const upload = multer({
  storage: multer.memoryStorage(), // Store files in memory
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

// Helper to run multer middleware
const runMiddleware = (req: NextApiRequest, res: NextApiResponse, fn: any) => {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
};

export const config = {
  api: {
    bodyParser: false, // Disable default bodyParser
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    console.log("✅ API route hit - Pages Router with Multer");

    // First parse the multipart form data with multer
    await runMiddleware(req, res, upload.single("fileUrl"));
    
    // Now we can access the file and other fields
    const file = (req as any).file;
    const body = (req as any).body;
    const { conversationId } = req.query;

    const content = body?.content || "";
    
    console.log("Received data:", { 
      hasFile: !!file, 
      fileName: file?.name,
      content, 
      conversationId 
    });

    // Get the session for authentication
    const session = await getServerSession(req, res, authOptions);
    if (!session || !session.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!conversationId) {
      return res.status(400).json({ message: "Conversation ID is required" });
    }

    if (!content && !file) {
      return res.status(400).json({ message: "Content or file is required" });
    }

    // Get user profile
    const profile = await db.profile.findUnique({
      where: { id: session.user.id }
    });

    if (!profile) {
      return res.status(401).json({ message: "Profile not found" });
    }

    let fileUrl = null;

    // Upload file to Cloudinary if exists
    if (file) {
      try {
        console.log("Starting Cloudinary upload for file:", file.originalname);
        
        // Convert multer file to File object for uploadToCloudinary
        const fileObj = new File([file.buffer], file.originalname, { type: file.mimetype });
        const uploadResult = await uploadToCloudinary(fileObj, 'discord-clone/direct-messages');
        
        fileUrl = uploadResult.secure_url;
        console.log("File uploaded to Cloudinary successfully:", fileUrl);
      } catch (uploadError) {
        console.error("Cloudinary upload error:", uploadError);
        return res.status(500).json({ message: "File upload failed" });
      }
    }

    const conversation = await db.conversation.findFirst({
      where: {
        id: conversationId as string,
        OR: [
          {
            memberOne: {
              profileId: profile.id,
            },
          },
          {
            memberTwo: {
              profileId: profile.id,
            },
          },
        ],
      },
      include: {
        memberOne: {
          include: {
            profile: true,
          },
        },
        memberTwo: {
          include: {
            profile: true,
          },
        },
      },
    });

    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    const member = conversation.memberOne.profileId === profile.id
      ? conversation.memberOne
      : conversation.memberTwo;

    if (!member) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const message = await db.directMessage.create({
      data: {
        content,
        fileUrl,
        memberId: member.id,
        conversationId: conversationId as string,
      },
      include: {
        member: {
          include: {
            profile: true,
          },
        },
      },
    });

    // For socket.io emission (if needed)
    // You might need to access the server instance differently in Pages Router
    // const io = (res as any).socket.server.io;
    // if (io) {
    //   io.emit(`chat:${conversationId}:messages`, message);
    // }

    return res.status(200).json(message);
  } catch (error) {
    console.error("[DIRECT_MESSAGES_POST_ERROR]", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
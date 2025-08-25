import { NextApiRequest } from "next";
import { NextApiResponseServerIo } from "@/types";
import { currentProfilePage } from "@/lib/current-profile-page";
import { db } from "@/lib/db";
import { uploadToCloudinary, isCloudinaryConfigured } from "@/lib/cloudinary";
import formidable from "formidable";

// Disable body parser for file uploads
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponseServerIo
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const profile = await currentProfilePage(req, res);
    if (!profile) return res.status(401).json({ message: "Unauthorized" });

    const { serverId, channelId } = req.query;
    if (!serverId) return res.status(400).json({ message: "Server id is required" });
    if (!channelId) return res.status(400).json({ message: "Channel id is required" });

    // ✅ Parse multipart form
    const form = formidable({ multiples: false });
    const [fields, files] = await new Promise<[any, any]>((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        resolve([fields, files]);
      });
    });
    // console.log("Line 39.......",fields);
    const content = fields.caption[0] as string || "";
    const uploadedFile = files.file?.[0];

    if (!content && !uploadedFile) {
      return res.status(400).json({ message: "Either content or file is required" });
    }

    // ✅ Check membership
    const server = await db.server.findFirst({
      where: {
        id: serverId as string,
        members: {
          some: {
            profileId: profile.id,
          },
        },
      },
      include: { members: true },
    });

    if (!server) return res.status(404).json({ message: "Server not found" });

    const channel = await db.channel.findFirst({
      where: { id: channelId as string, serverId: serverId as string },
    });
    if (!channel) return res.status(404).json({ message: "Channel not found" });

    const member = server.members.find((m) => m.profileId === profile.id);
    if (!member) return res.status(401).json({ message: "Unauthorized" });

    // ✅ Upload file to Cloudinary if exists
    let fileUrl: string | null = null;
    if (uploadedFile && isCloudinaryConfigured()) {
      const result = await uploadToCloudinary(uploadedFile, "connectly");
      fileUrl = result.secure_url;
    }

    // ✅ Save message
    const message = await db.message.create({
      data: {
        content: content || "",
        fileUrl: fileUrl ?? null,
        memberId: member.id,
        channelId: channelId as string,
      },
      include: {
        member: { include: { profile: true } },
      },
    });

    // ✅ Emit socket event
    const channelKey = `chat:${channelId}:messages`;
    res?.socket?.server?.io.emit(channelKey, message);

    return res.status(200).json({ message });
  } catch (error) {
    console.error("[MESSAGES_POST_ERROR]", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

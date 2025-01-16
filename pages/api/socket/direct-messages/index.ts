import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { NextApiResponseServerIo } from "@/types";
import { NextApiRequest } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponseServerIo
) {
  if (req.method !== "POST")
    return res.status(405).json({ message: "Method not allowed" });

  try {
    const profile = await currentProfile();
    const { content, fileUrl } = req.body;

    const { conversationId } = req.query;

    if (!profile) return res.status(401).json({ message: "Unauthorized" });
    if (!conversationId)
      return res.status(400).json({ message: "Conversation id is required" });

    if (!content)
      return res.status(400).json({ message: "Content is required" });

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

    if (!conversation)
      return res.status(404).json({ message: "Conversation not found" });

    const member = conversation.memberOne.profileId === profile.id
      ? conversation.memberOne
      : conversation.memberTwo;

    if (!member) return res.status(401).json({ message: "Unauthorized" });

    const message = await db.directMessage.create({
      data: {
        content,
        fileUrl,
        memberId: member.id,
        conversationId: conversation.id as string,
      },
      include: {
        member: {
          include: {
            profile: true,
          },
        },
      },
    });

    const channelKey = `chat:${conversationId}:messages`;

    res?.socket?.server?.io.emit(channelKey, message);

    return res.status(200).json({ message });
  } catch (error) {
    console.log("[DIRECT_MESSAGES_POST_ERROR]", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

import { ChatHeader } from "@/components/chat/chat-header";
import { ChatInput } from "@/components/chat/chat-input";
import { ChatMessages } from "@/components/chat/chat-messages";
import { MediaRoom } from "@/components/media-room";
import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { ChannelType } from "@prisma/client";
import { redirect } from "next/navigation";

interface ChannelIdProps {
  params: Promise<{
    serverId: string;
    channelId: string;
  }>
}

const ChannelId = async ({params}:ChannelIdProps) => {
  const {channelId,serverId} = await params;
  const profile = await currentProfile();

  if (!profile) return redirect('/login');

  const channel = await db.channel.findFirst({
    where: { id: channelId },
  });

  const member = await db.member.findFirst({
    where: { profileId: profile.id, serverId },
  });

  if (!channel || !member) return redirect("/");

  return (
    <div className="bg-white dark:bg-[#313338] flex flex-col h-full">
      <ChatHeader
        name={channel.name}
        serverId={channel.serverId}
        type="channel"
      />

      {/* {channel.type === ChannelType.TEXT && (
        <>
          <ChatMessages
            name={channel.name}
            member={member}
            chatId={channel.id}
            apiUrl="/api/messages"
            socketUrl="/api/socket/messages"
            socketQuery={{
              channelId: channel.id,
              serverId: channel.serverId,
            }}
            paramKey="channelId"
            paramValue={channel.id}
            type="channel"
          />
          <ChatInput
            apiUrl="/api/socket/messages"
            query={{
              channelId: channel.id,
              serverId: channel.serverId,
            }}
            name={channel.name}
            type="channel"
          />
        </>
      )} */}
      
      {channel.type === ChannelType.AUDIO && (
        <MediaRoom audio={true} video={false} chatId={channel.id} />
      )}

      {channel.type === ChannelType.VIDEO && (
        <MediaRoom audio={true} video={true} chatId={channel.id} />
      )}

    </div>
  );
};

export default ChannelId;

"use client";

import { useEffect, useState } from "react";
import { LiveKitRoom, VideoConference } from "@livekit/components-react";

import "@livekit/components-styles";
import { Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";

interface MediaRoomProps {
  chatId: string;
  video: boolean;
  audio: boolean;
}

export const MediaRoom: React.FC<MediaRoomProps> = ({
  chatId,
  video,
  audio,
}) => {
  const { data: session } = useSession();
  const [token, setToken] = useState("");

  useEffect(() => {
    // console.log("Line 25 : ",session);
    if (!session?.user?.name) return;

    const name = `${session?.user?.name}`;
    // console.log("Line 29 :",name);

    (async () => {
      try {
        console.log("Line 32 : ");
        const response = await fetch(
          `/api/livekit?room=${chatId}&username=${name}`
        );
        const data = await response.json();
        // console.log("Line 38 : ",JSON.parse(data.token));
        // console.log("Token from API:", data.token);
        // console.log("Type of token:", typeof data.token);
        setToken(String(data.token));
      } catch (error) {
        console.log(error);
      }
    })();
  }, [chatId, session?.user?.name]);

  if (token === "") {
    return (
      <div className="flex flex-col flex-1 justify-center items-center">
        <Loader2 className="h-7 w-7 text-zinc-500 animate-spin my-4" />
        <p className="text-xs text-zinc-500 dark:text-zinc-400">Loading...</p>
      </div>
    );
  }

  return (
    <LiveKitRoom
      data-lk-theme="default"
      serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
      token={token}
      connect={true}
      audio={audio}
      video={video}
    >
      <VideoConference />
    </LiveKitRoom>
  );
};

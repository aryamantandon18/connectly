import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";

interface ServerIdPageProps{
  params:{
    serverId: string;
  }
}
const ServerIdPage: React.FC<ServerIdPageProps> = async ({
  params: { serverId },
}) => {
  const profile = await currentProfile();
  if(!profile) return redirect("/login");

  const server = await db.server.findUnique({
    where: {
      id: serverId,
      members: {
        some: {
          profileId: profile.id,
        },
      },
    },
  })

  return (
    <div>Server Id Page</div>
  )
}

export default ServerIdPage 
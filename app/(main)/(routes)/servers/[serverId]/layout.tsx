import {ServerSidebar} from "@/components/server/server-sidebar";
import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";

interface ServerIdLayoutProps {
  children: React.ReactNode;
  params: Promise<{
    serverId: string;
  }>
}

const ServerIdLayout: React.FC<ServerIdLayoutProps> = async ({
  children,
  params,
}) => {
  const profile = await currentProfile();
  const {serverId} = await params;

  if (!profile) return redirect("/login");

  const server = await db.server.findUnique({
    where: {
      id: serverId,
      members: {
        some: {
          profileId: profile.id,
        },
      },
    },
  });

  if (!server) return redirect("/");
  return (
    <div className="h-full">
      <div className="hidden md:flex h-full w-60 z-20 flex-col fixed inset-y-0">
        <ServerSidebar serverId={serverId}/>
      </div>
      <main className="h-full md:pl-60">{children}</main>
    </div>
  );
};

export default ServerIdLayout;

import { currentProfile } from "@/lib/current-profile"
import { db } from "@/lib/db";
import { MemberRole } from "@prisma/client";
import { NextResponse } from "next/server";

/**
 * This API endpoint allows an authenticated user with the role of ADMIN or MODERATOR 
 * in a specific server to create a new channel within that server. 
 * 
 * - First, it verifies that the server exists and that the user is a member of the server 
 *   with either an ADMIN or MODERATOR role (`members.some` condition). 
 * - If the conditions are met, it creates a new channel (`channels.create`) 
 *   with the provided `profileId`, `name`, and `type`. 
 * - The updated server object, including the newly created channel, is then returned 
 *   (`include: { channels: true }`) to ensure the channel creation is reflected in the response.
 * 
 * This ensures that only authorized users can create channels within a server context.
 */

export async function POST(req:Request){
    try {
        const profile = await currentProfile();
        const { name, type } = await req.json();
        const { searchParams } = new URL(req.url);
    
        const serverId = searchParams.get("serverId");
    
        if (!profile) return new NextResponse("Unauthorized", { status: 401 });
        if (!serverId)
          return new NextResponse("Server Id missing", { status: 400 });
        if (!name) return new NextResponse("Name missing", { status: 400 });
        if (name === "general")
          return new NextResponse("Name cannot be general", { status: 400 });
        if (!type) return new NextResponse("Type missing", { status: 400 });

        const server = await db.server.update({
            where:{
                id: serverId,
                members: {
                    some:{
                        profileId: profile.id,
                        role:{ in: [MemberRole.ADMIN,MemberRole.MODERATOR] }
                    },
                },
            },
            data:{
                channels:{
                    create:{
                        profileId:profile.id,
                        name,
                        type,
                    },
                }
            },
            include:{
                channels: true,
            }
        })

        return NextResponse.json(server);
    } catch (error) {
        console.log(`["CHANNELS_POST", ${error}]`);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
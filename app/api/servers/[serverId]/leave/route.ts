import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function PATCH(req:Request,{params}:{params:{serverId:string}}){
    try {
        const profile = await currentProfile();

        if(!profile) return new NextResponse("UnAuthorized",{status: 401});
        if(!params.serverId)
            return new NextResponse("Server ID missing",{status: 400});

        const server = await db.server.update({
            where:{
                id:params.serverId,
                profileId:{
                    not: profile.id,                     // Ensures the current user is not the owner of the server.
                },
                members:{
                    some:{profileId:profile.id}            // Ensures the user is currently a member of the server. so that only members can leave the server.
                },
            },
            data:{
                members:{
                    deleteMany:{profileId:profile.id},        // Removes the user from the members list of the server.
                }   
            }
        });

        return NextResponse.json(server);
    } catch (error) {
        console.log(`[SERVER_ID_LEAVE], ${error}`);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}

const server = db.server.update({
    where:{id:serverId , profildId:profile.id,
        members:{
            some:{
                profileId:profile.id ,
            }
        }
    },
    data:{

    }
})
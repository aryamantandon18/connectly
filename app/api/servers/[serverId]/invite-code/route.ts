import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import {v4 as uuidV4} from "uuid";


export async function PATCH(
    req:Request,
    {params}:{params: {serverId:string}}
){
    try {
        const profile = await currentProfile();
        if(!profile){
            return new NextResponse("UnAuthorized",{status:401});
        }
        const {serverId} = params;
        if(!serverId){
            return new NextResponse("Server Id Missing", {status: 400});
        }

        const server = await db.server.update({
            where:{
                id: serverId,
                profileId: profile.id,
            },
            data:{
                inviteCode: uuidV4(),
            }
        })
        return NextResponse.json(server);
    } catch (error) {
        console.log(`[SERVER_ID_PATCH] ${error}`);
        return new NextResponse("Internal Server Error", { status: 500});
    }
}
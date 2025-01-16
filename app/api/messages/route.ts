import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { Message } from "@prisma/client";
import { NextResponse } from "next/server";

const MSG_BATCH = 10;
export async function GET(req:Request){
    try {
        const profile = await currentProfile();
        const {searchParams} = new URL(req.url);

        const cursor = searchParams.get("cursor");     // cursor tells the infinity load that what messages to load to next batch of messages , it is a conventional method for infinite loading
        const channelId = searchParams.get("channelId");

        if(!profile) return new NextResponse("UnAuthorized", { status: 401 })
        if(!channelId) return new NextResponse("Missing channelId", { status: 400 });
        
        let messages:Message[] = [];
        if(cursor){
            messages = await db.message.findMany({
                take: MSG_BATCH,
                skip:1,
                cursor:{id:cursor},     // cursor is buildin in prisma
                where:{id:channelId},
                include:{member:{include:{profile:true}}},
                orderBy:{createdAt: "desc"},
            })
        }else{
            messages = await db.message.findMany({
                take:MSG_BATCH,
                where:{channelId,},
                include:{member:{include:{profile:true}}} ,
                orderBy:{createdAt: "desc"},
            })
        }

        let nextCursor = null;
        // in case when tha messages.length < MSG_BATCH , it indicate the tanstack the we have reached the end & there is no need to change the value of nextCursor
        if(messages.length === MSG_BATCH){
            nextCursor = messages[messages.length - 1].id;
        }

        return NextResponse.json({
            items:messages,
            nextCursor,
        })

    } catch (error) {
        console.log("[MESSAGES_GET_ERROR]", error);
        return new NextResponse("Internam Error", { status: 500 });
    }
}
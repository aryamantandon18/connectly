import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { MemberRole } from "@prisma/client";
import { NextResponse } from "next/server";

/**
 * DELETE API:
 * This endpoint allows an authenticated user with the role of ADMIN or MODERATOR 
 * in a specific server to delete a channel, provided it is not the "general" channel.
 * 
 * - Validates if the user is authenticated (`currentProfile`) and verifies `serverId` 
 *   and `channelId` parameters.
 * - Ensures the user has the ADMIN or MODERATOR role in the server (`members.some` condition).
 * - Deletes the specified channel (`channels.delete`) as long as its `name` is not "general".
 * - Returns the updated server object, including its members and their profiles (`include: members`).
 * 
 * This ensures that only authorized users can delete channels and prevents the deletion 
 * of the default "general" channel.
 */

export async function DELETE(      // delete channel from server-sidebar
  req: Request,
  { params }: { params: { channelId: string } }
) {
  const profile = await currentProfile();
  const { searchParams } = new URL(req.url);
  const serverId = searchParams.get("serverId");

  if (!profile) return new NextResponse("Unauthorized", { status: 401 });
  if (!serverId) return new NextResponse("Server Id missing", { status: 400 });
  if (!params.channelId)
    return new NextResponse("Channel Id missing", { status: 400 });

  try {
    const server = await db.server.update({
      where: {
        id: serverId,
        members: {
          some: {
            profileId: profile.id,
            role: {
              in: [MemberRole.ADMIN, MemberRole.MODERATOR],
            },
          },
        },
      },
      data: {
        channels: {
          delete: {
            id: params.channelId,
            name: {
              not: "general",
            },
          },
        },
      },
      include: {
        members: {
          include: {
            profile: true,
          },
          orderBy: {
            role: "asc",
          },
        },
      },
    });

    return NextResponse.json(server);
  } catch (error) {
    console.log(`["CHANNEL_ID_DELETE", ${error}]`);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

/**
 * PATCH API:
 * This endpoint allows an authenticated user with the role of ADMIN or MODERATOR 
 * in a specific server to update the details of a channel (e.g., name, type), 
 * provided the channel is not named "general".
 * 
 * - Validates if the user is authenticated (`currentProfile`) and verifies `serverId` 
 *   and `channelId` parameters.
 * - Ensures the user has the ADMIN or MODERATOR role in the server (`members.some` condition).
 * - Prevents renaming the "general" channel (`NOT: { name: "general" }`).
 * - Updates the specified channel (`channels.update`) with the provided `name` and `type`.
 * 
 * This ensures that only authorized users can update channels while protecting 
 * the integrity of the default "general" channel.
 */
export async function PATCH(         // edit channel from server-sidebar
  req: Request,
  { params }: { params: { channelId: string } }
) {
  const profile = await currentProfile();
  const { searchParams } = new URL(req.url);
  const serverId = searchParams.get("serverId");
  const { name, type } = await req.json();

  if (!profile) return new NextResponse("Unauthorized", { status: 401 });
  if (!serverId) return new NextResponse("Server Id missing", { status: 400 });
  if (!params.channelId)
    return new NextResponse("Channel Id missing", { status: 400 });

  if (name === "general")
    return new NextResponse("Cannot rename general channel", { status: 400 });

  try {
    const server = await db.server.update({
      where: {
        id: serverId,
        members: {
          some: {
            profileId: profile.id,
            role: {
              in: [MemberRole.ADMIN, MemberRole.MODERATOR],
            },
          },
        },
      },
      data: {
        channels: {
          update: {
            where: {
              id: params.channelId,
              NOT: {
                name: "general",
              },
            },
            data: {
              name,
              type,
            },
          },
        },
      },
    });

    return NextResponse.json(server);
  } catch (error) {
    console.log(`["CHANNEL_ID_PATCH", ${error}]`);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

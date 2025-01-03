import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

/**
  DELETE API:
  This endpoint allows a server owner (authenticated user) to remove a specific member from the server, 
  provided the member being removed is not the server owner themselves.
  
  - Validates if the user is authenticated (`currentProfile`) and verifies `serverId` 
    and `memberId` parameters.
  - Ensures that the authenticated user is the owner of the server (`profileId: profile.id`).
  - Deletes the specified member (`members.delete`) while ensuring the member being removed 
    is not the server owner (`profileId: { not: profile.id }`).
  - Returns the updated server object, including its members and their profiles (`include: members`).
  
  This ensures only the server owner can remove other members, maintaining proper access control.
 */

export async function DELETE(
  req: Request,
  { params }: { params: { memberId: string } }
) {
  const profile = await currentProfile();
  const { searchParams } = new URL(req.url);
  const serverId = searchParams.get("serverId");

  if (!profile) return new NextResponse("Unauthorized", { status: 401 });
  if (!serverId) return new NextResponse("Server Id missing", { status: 400 });
  if (!params.memberId)
    return new NextResponse("Member Id missing", { status: 400 });

  try {
    const server = await db.server.update({
      where: {
        id: serverId,
        profileId: profile.id,
      },
      data: {
        members: {
          delete: {
            id: params.memberId,
            profileId: {
              not: profile.id,
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
    console.log(`["MEMBER_ID_DELETE", ${error}]`);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

/**
 * PATCH API:
 * This endpoint allows a server owner (authenticated user) to update the role of a specific member 
 * within the server, provided the member being updated is not the server owner themselves.
 * 
 * - Validates if the user is authenticated (`currentProfile`) and verifies `serverId` 
 *   and `memberId` parameters.
 * - Ensures that the authenticated user is the owner of the server (`profileId: profile.id`).
 * - Updates the role of the specified member (`members.update`) while ensuring the member being updated 
 *   is not the server owner (`profileId: { not: profile.id }`).
 * - Returns the updated server object, including its members and their profiles (`include: members`).
 * 
 * This ensures only the server owner can update member roles, maintaining proper authority and security.
 */
export async function PATCH(
  req: Request,
  { params }: { params: { memberId: string } }
) {
  try {
    const profile = await currentProfile();
    const { searchParams } = new URL(req.url);
    const { role } = await req.json();

    const serverId = searchParams.get("serverId");

    if (!profile) return new NextResponse("Unauthorized", { status: 401 });
    if (!serverId)
      return new NextResponse("Server Id missing", { status: 400 });
    if (!params.memberId)
      return new NextResponse("Member Id missing", { status: 400 });

    const server = await db.server.update({
      where: {
        id: serverId,
        profileId: profile.id,
      },
      data: {
        members: {
          update: {
            where: {
              id: params.memberId,
              profileId: {
                not: profile.id,
              },
            },
            data: {
              role,
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
    console.log(`["MEMBER_ID_PATCH", ${error}]`);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

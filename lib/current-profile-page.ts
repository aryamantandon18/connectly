import { getSession } from "next-auth/react";
import { db } from "@/lib/db";
import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function currentProfilePage(req:NextApiRequest,res:NextApiResponse) {
  const session = await getServerSession(req,res,authOptions);
  console.log("Line 8", session);
  if (!session?.user?.id) {
    return null;
  }

  const profile = await db.profile.findUnique({
    where: { userId: session.user.id },
  });

  return profile;
}

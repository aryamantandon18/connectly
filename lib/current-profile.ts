import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/lib/db";    
import { getServerSession } from "next-auth";

export async function currentProfile() {
  const session = await getServerSession(authOptions);

  // console.log("Line 8",session);
  if (!session?.user?.id) {
    return null;
  }

  const profile = await db.profile.findUnique({
    where: { userId: session.user.id },
  });

  return profile;
}

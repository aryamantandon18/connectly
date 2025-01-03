import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export const initialProfile = async () => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    console.log("Line 8");
    return redirect("/login");
  }

  const profile = await db.profile.findUnique({
    where: { userId: session.user.id },
  });

  if (profile) return profile;
};

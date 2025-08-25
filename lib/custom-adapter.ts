import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "./db";
import type { Adapter, AdapterUser } from "next-auth/adapters"; // Optional, for return type

export function CustomPrismaAdapter(): Adapter {
  const baseAdapter = PrismaAdapter(db);

  return {
    ...baseAdapter,
    async createUser(userData:AdapterUser): Promise<AdapterUser> {
      if(!baseAdapter) throw new Error("Adapter createUser method is not defined");
       const { name, image, id, ...userWithoutId } = userData;

      const user = await baseAdapter.createUser!(userWithoutId as Omit<AdapterUser, "id">);

      // Create associated profile using userData (name and image are stored in Profile)
      await db.profile.create({
        data: {
          userId: user.id,
          name: name || "OAuth User",
          email: user.email || "",
          imageUrl: image || "", // Use `as any` if extending types
        },
      });


      return user;
    },
  };
}

// Omit<AdapterUser, "id">: This is the shape of user data passed in during creation — id will be created by the database.
import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name:string;
      image:string;
    }
  }

  interface User {
    id: string;
    email: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    id?:string;
    email?: string;
    profile?: {
      name?: string;
      imageUrl?: string;
    };
  }
}
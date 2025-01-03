import NextAuth,{ NextAuthOptions, Session } from "next-auth";
import GithubProvider from "next-auth/providers/github";
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { db } from "@/lib/db";
import { JWT } from "next-auth/jwt";
import bcryptjs from 'bcryptjs';
import { User } from "next-auth";


export const authOptions:NextAuthOptions = {
  adapter: PrismaAdapter(db),
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email", placeholder: "test@example.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials): Promise<User | null> {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials");
        }

        const user = await db.user.findUnique({ where: { email: credentials.email } });
        
        if (!user || !user.password){
          throw new Error("Invalid email or password");
        }

        const passwordMatch = await bcryptjs.compare(
          credentials.password,
          user.password
        );

        if(!passwordMatch){
          throw new Error("Invalid credentials")
        }

        // if(!user.emailVerified){
        //   throw new Error("Email not verified")
        // }
        
        return {
          id: user.id,
          email: user.email!,
        } as User; // Explicitly cast as User to ensure TypeScript compatibility.
      }
    })  
  ],
  pages: {
    signIn: "/login",
    // error: "/error",
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV !== "production",
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 1 day
  },
  callbacks: {
    async session({ session, token, user }: { session: Session; token: JWT; user: any }) {
      if (token) {
        session.user.id = token.id || ""; // Ensure id is set
        session.user.email = token.email || "";
        session.user.profile = {
          name: token.profile?.name || "",
          image: token.profile?.image || "",
        };
      }
      return session;
    },
    async jwt({ token,account, user }: { token: JWT; account:any ;user?: any }) {
      if (user) {
        token.id = user.id
        token.email = user.email;

       // Fetch profile details from your database if needed
       const userProfile = await db.profile.findUnique({
        where: { userId: user.id },
       });

        token.profile = {
          name: userProfile?.name || "",
          image: userProfile?.image || "",
        };
        token.accessToken = account.access_token
      }
      else if(account){
        account.access_token = undefined;
      }
      return token;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

"use client"; // Add this to the top of the file

import { SessionProvider } from "next-auth/react";

export const AuthWrapper = ({ children, session }: { children: React.ReactNode; session: any }) => {
  return <SessionProvider session={session}>{children}</SessionProvider>;
};

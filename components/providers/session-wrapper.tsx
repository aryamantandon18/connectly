"use client"; // Ensure this is a client-side component

import { SessionProvider } from "next-auth/react";

export const SessionWrapper = ({ children }: { children: React.ReactNode }) => {
  return <SessionProvider>{children}</SessionProvider>;
};
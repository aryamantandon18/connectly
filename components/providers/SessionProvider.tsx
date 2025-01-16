"use client"; // Add this to the top of the file

import { SessionProvider } from "next-auth/react";
import { useEffect, useState } from "react";

export const AuthWrapper = ({ children }: { children: React.ReactNode;}) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return <SessionProvider>{children}</SessionProvider>;
};

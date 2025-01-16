"use client"

import { Badge } from "@/components/ui/badge";
import { useSocket } from "@/components/providers/socket-provider";
import { useEffect, useState } from "react";

export const SocketIndicator = () => {
  const { isConnected } = useSocket();
  const [isMounted,setIsMounted] = useState(false);

  useEffect(()=>{
    setIsMounted(true);
  },[])

  if(!isMounted) return null;
  if (!isConnected) {
    return (
      <Badge variant="outline" className="bg-yellow-600 text-white border-none">
        Fallback: Polling every 1s
      </Badge>
    );
  }

  if (isConnected) {
    return (
      <Badge
        variant="outline"
        className="bg-emerald-600 text-white border-none"
      >
        Live: Real time updates 
      </Badge>
    );
  }
};

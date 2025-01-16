"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { io as ClientIO,Socket } from "socket.io-client";

type SocketContextType = {
  socket: any | null;
  isConnected: boolean;
};

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    const socketInstance = ClientIO(siteUrl, {
      path: "/api/socket/io",
      addTrailingSlash: false,  
    });

    setSocket(socketInstance);

    socketInstance.on("connect", () => {
      console.log("Connected to Socket.IO server");
      setIsConnected(true);
    });

    socketInstance.on("disconnect", () => {
      console.log(" Disconnected from Socket.IO server");
      setIsConnected(false);
    });

    socketInstance.on("connect_error", (err) => {
      console.error("Connection error:", err.message);
    });

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};

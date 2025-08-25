"use client";

import { useSession } from "next-auth/react";
import { createContext, useContext, useEffect, useState } from "react";
import { io as ClientIO,Socket } from "socket.io-client";

type SocketContextType = {
  socket: any | null;
  isConnected: boolean;
  onlineUsers:string[];
};

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false, 
  onlineUsers:[],
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const {data:session,status} = useSession();

  useEffect(() => {
    if (status !== "authenticated") return; // Wait until user is authenticated
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

    const socketInstance = ClientIO(siteUrl, {
      path: "/api/socket/io",        
      addTrailingSlash: false,  
      withCredentials: true,
    });
  //     // Add debug listeners
  // socketInstance.onAny((event, ...args) => {
  //   console.log(`[Socket Event] ${event}`, args);
  // });

    setSocket(socketInstance);

    socketInstance.on("connect", () => {
      console.log("Connected to Socket.IO server");
      setIsConnected(true);

      const userId = session?.user?.id;
      if(userId){
        console.log("Line 44 user online emitting",userId);
        setTimeout(() =>{
          socketInstance.emit("user-online",userId);
        },150)
      }
    });

    socketInstance.on("online-users",(userIds:string[])=>{
      console.log("Line 50",userIds);
      setOnlineUsers(userIds);
    })

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
  },[status,session]);

  return (
    <SocketContext.Provider value={{ socket, isConnected ,onlineUsers}}>
      {children}
    </SocketContext.Provider>
  );
};

import { Server as NextServer } from "http";
import { NextApiRequest } from "next";
import { Server as SocketIOServer } from "socket.io";
import { NextApiResponseServerIo } from "@/types";

// Disables the default Next.js body parser, which is important because Socket.IO works at a lower protocol level (WebSocket) and doesn’t use HTTP bodies.
export const config = {
  api: {
    bodyParser: false,
  },
};

const onlineUsers = new Map<string,string>();

const ioHandler = (req: NextApiRequest, res: NextApiResponseServerIo) => {
  console.log("ioHandler hit"); // <- YOU SHOULD SEE THIS
  if (!res.socket.server.io) { 
    // console.log("*First use, starting socket.io");
    const path = "/api/socket/io";
    const httpServer: NextServer = res.socket.server as any;
    const io = new SocketIOServer(httpServer, {
      path: path,
      addTrailingSlash: false,
      transports: ["websocket", "polling"],
        cors: {
    origin: process.env.NEXT_PUBLIC_SITE_URL,
    credentials:true
  },
    });

    io.on("connection",(socket)=>{
      // console.log("New connection - ID:", socket.id);
      // console.log("Handshake headers:", socket.handshake.headers);
      // console.log("Handshake cookies:", socket.handshake.headers.cookie);

      socket.on("user-online",(userId:string)=>{
        console.log("Line 30 user online",userId);
        onlineUsers.set(userId,socket.id);
        io.emit("online-users",Array.from(onlineUsers.keys()));
      })

        socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);

        // Find and remove disconnected user
        for (const [userId, socketId] of onlineUsers.entries()) {
          if (socketId === socket.id) {
            onlineUsers.delete(userId);
            break;
          }
        }

        io.emit("online-users", Array.from(onlineUsers.keys()));
      });   
    })
    
    res.socket.server.io = io;
  } else {
    console.log("socket.io already running");
  }
  res.end();
};

export default ioHandler;
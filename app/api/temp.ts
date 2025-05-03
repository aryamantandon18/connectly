// import { NextApiResponseWithSocket } from '@/types';
// // import {Server as NetServer} from 'net';
// import { NextApiRequest } from 'next';
// import {Server as SocketIOServer} from 'socket.io';
// import { Server as HTTPServer } from 'http';


// const ioHandler = async(req: NextApiRequest, res: NextApiResponseWithSocket) => {
//     if (req.method !== "GET") {
//         res.status(405).json({ error: "Method Not Allowed" });
//         return;
//       }

//     if(!res.socket.server.io){
//         console.log('Starting Socket.io server....');
//         const path = "/api/socket"
//         const httpServer = res.socket.server as unknown as HTTPServer; // Ensure it's cast as an HTTP server
//         const io = new SocketIOServer(httpServer,{
//             path:path,
//             cors: {
//                 origin: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",// Adjust this to match your frontend domain in production
//                 methods: ["GET", "POST"],
//               },
//               transports: ["websocket"], // Ensure consistency
//                 addTrailingSlash: false,
//         })
//         res.socket.server.io = io;

//         io.on("connection", (socket) => {
//             console.log("A client connected", socket.id);
      
//             socket.on("disconnect", () => {
//               console.log("Client disconnected", socket.id);
//             });
//           });
//     }else{
//         console.log("socket.io already connected");
//     }
//     res.end();
// }    

// export default ioHandler;
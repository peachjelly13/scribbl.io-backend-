import { Server } from 'socket.io';
import redis from '../redis/redis.connection.js';
import { findOrCreateRooms,generateUserId } from '../utils/generateIds.js';


const userSocketMap = new Map(); // userId -> socketId maps the userId to their socket connection
const socketUserMap = new Map(); // socketId -> userId which user holds which socket connection 

function setupSocket(server){
    const io = new Server(server,{cors:{origin:"*"}});
    io.on("connection",async(socket)=>{
        console.log(`User connected ${socket.id}`);

        socket.on("connectUser",async({username,avatar,privateRoomId})=>{
            let roomId = privateRoomId || findOrCreateRooms();
            const userId = await generateUserId();

        })

    })


}

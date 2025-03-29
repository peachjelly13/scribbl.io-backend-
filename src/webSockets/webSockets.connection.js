import { Server } from 'socket.io';
import redis from '../redis/redis.connection.js';
import { generateUserId } from '../utils/generateIds.js';
import { findOrCreateRoomsWithSpace } from '../utils/roomFunctions.js';


const userSocketMap = new Map(); // userId -> socketId maps the userId to their socket connection
const socketUserMap = new Map(); // socketId -> userId which user holds which socket connection 

function setupSocket(server){
    const io = new Server(server,{cors:{origin:"*"}});
    io.on("connection",async(socket)=>{
        console.log(`User connected ${socket.id}`);

        socket.on("connectUser",async({username,avatar,privateRoomId})=>{
            let roomId;
            if(privateRoomId){
                const privateRoomExists = await redis.sismember("activeRooms",privateRoomId);
                if(!privateRoomExists){
                    socket.emit("error",{message:"Invalid private room Id"})
                    return;
                }
                else{
                    roomId = privateRoomId;
                }
            }
            else{
                roomId = await findOrCreateRoomsWithSpace();
            }
            const userId = await generateUserId();
            userSocketMap.set(userId,socket.id);
            socketUserMap.set(socket.id,userId)

            await redis.hset(`user:${userId}`,{
                roomId,
                avatar,
                username
            });
            await redis.sadd(`room:${roomId}`,userId)


        })

    })


}

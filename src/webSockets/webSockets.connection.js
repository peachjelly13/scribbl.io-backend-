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
            socket.join(roomId);
            io.to(socket.id).emit("roomJoined",{roomId,userId,avatar,username});
            console.log(`UserId ${userId} on the connection ${socket.id} joined room ${roomId}`)
        });

        socket.on("disconnect",async()=>{
            const userId = socketUserMap.get(socket.id);
            //user connected at a particular socket.id what user is at what socket.id
            if(!userId){
                return;
            }
            const userData = await redis.hgetall(`user:${userId}`);
            if(userData?.roomId){
                io.to(userData.roomId).emit("userDisconnect",{userId});
                console.log(`User ${userId} disconnected from the room ${userData.roomId}`);
                userSocketMap.delete(userId);
                // remove this user from the map as we no longer have their connection
                socketUserMap.delete(socket.id);
                // remove the socket.id related to a particular user

            }
        });

        socket.on("reconnect",async({userId,roomId})=>{
            const userData = await redis.hgetall(`user:${userId}`);
            if(!userData || userData.roomId !== roomId){
                socket.emit("error",{message:"Session expired or invalid userId or roomId"})
            }
            userSocketMap.set(userId,socket.id);
            socketUserMap.set(socket.id,userId);
            const isUserInRoom = await redis.sismember(`room:${roomId}`,userId);
            if(!isUserInRoom){
                socket.emit("error",{message:"No such user in the room"});
                return;
            }
            socket.join(roomId);
            io.to(roomId).emit("userConnected",{userId});
            console.log(`User ${userId} reconnected to the room ${roomId}`)

        })

    })


}


export {setupSocket}
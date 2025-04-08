import { Server } from 'socket.io';
import redis from '../redis/redis.connection.js';
import { generateUserId } from '../utils/generateIds.js';
import { findOrCreateRoomsWithSpace} from '../utils/roomFunctions.js';
import { createPrivateRoom } from '../utils/roomFunctions.js';
import { gameSettings } from '../utils/gameSetting.js';


const userSocketMap = new Map(); // userId -> socketId maps the userId to their socket connection
const socketUserMap = new Map(); // socketId -> userId which user holds which socket connection 

function setupSocket(server){
    const io = new Server(server,{cors:{origin:"*"}});
    io.on("connection",async(socket)=>{
        console.log(`User connected ${socket.id}`);

        socket.on("connectUser",async({username,avatar,isPrivate,privateRoomId})=>{
            let roomId;
            const userId = await generateUserId();
            if(isPrivate && !privateRoomId){
                roomId = await createPrivateRoom();
                await redis.set(`room:${roomId}:host`,userId);
                await redis.hset(`room:${roomId}:settings`,gameSettings)

            }
            else if(privateRoomId && isPrivate){
                const privateRoomExists = await redis.sismember("privateRooms",privateRoomId);
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
                await redis.set(`room:${roomId}:settings`,gameSettings)
            }
            
            userSocketMap.set(userId,socket.id);
            socketUserMap.set(socket.id,userId)

            await redis.hset(`user:${userId}`,{
                roomId,
                avatar,
                username
            });
            const players = await redis.sadd(`room:${roomId}:players`,userId);
            io.to(roomId).emit("updatedPlayerList",players)
            
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

        });
        // in case of a private room we give the option to start game
        // so the frontend should send isPrivate True the moment user creates on private room
        // when a user joins using a link they will see the option of play
        // overbody else but the host will join using the link
        // in case of a public room we will show enter button
        // this is the general idea
        socket.on("gameSettings",async({}))

    })


}


export {setupSocket}
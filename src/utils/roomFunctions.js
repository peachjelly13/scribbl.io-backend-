import redis from "../redis/redis.connection.js"
import { generateRandomRoomId } from "./generateIds.js";

export const findOrCreateRoomsWithSpace =async()=>{
    const rooms = await redis.smembers("activeRooms");
    //will fetch all the rooms 
    for(let roomId of rooms){
        const playerCount = await redis.scard(`room:${roomId}:players`);
        if(playerCount<7){
            return roomId
        }
    }
    const newRoomId = await generateRandomRoomId();
    await redis.sadd("activeRooms", newRoomId);
    return newRoomId;
}

export const createPrivateRoom = async()=>{
    const newPrivateRoomId = await generateRandomRoomId();
    await redis.sadd("privateRooms",newPrivateRoomId);
    return newPrivateRoomId;
}

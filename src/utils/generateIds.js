import redis from "../redis/redis.connection.js"
import { nanoid } from "nanoid";

export const generateRandomRoomId=()=>{
    return nanoid(6);
}

export const generateUserId=()=>{
    return `UID_${nanoid(8)}`
}



import redis from "../redis/redis.connection.js"
import { nanoid } from "nanoid";

function generateRandomRoomId(){
    return nanoid(6);
}


export const findOrCreateRooms = async()=>{

}
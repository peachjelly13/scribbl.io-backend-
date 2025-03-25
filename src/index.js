import express from 'express'
import { client,connectRedis } from './redis/redis.connection.js';

import http from 'http'
import { Server } from 'socket.io';
const app = express();
const server = http.createServer(app)
const io = new Server(server)
const PORT = 8000;
app.use(express.static('public'));
function socketConnection(){
    io.on('connection',(socket)=>{
    console.log('A client connected:', socket.id);
})}
server.listen(PORT,()=>{
    connectRedis();
    socketConnection();
    console.log(`App is listening on ${PORT}`)
})

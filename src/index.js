import express from 'express'
import {testRedis} from './redis/redis.connection.js';
import http from 'http'
import { setupSocket } from './webSockets/webSockets.connection.js';


const app = express();
const server = http.createServer(app)
const PORT = 8000;
app.use(express.static('public'));


testRedis().then(()=>{server.listen(PORT,()=>{
    setupSocket(server);
    console.log(`App is listening on ${PORT}`)
})})


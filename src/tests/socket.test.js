import http from 'http';
import express from 'express';
import { setupSocket } from '../webSockets/webSockets.connection.js'; // Assuming correct path
import { io as Client } from 'socket.io-client';

let server, clientSocket;

beforeAll((done) => {
  const app = express();
  server = http.createServer(app);
  setupSocket(server);
  server.listen(() => {
    const port = server.address().port;
    clientSocket = Client(`http://localhost:${port}`);
    clientSocket.on("connect", () => {
      console.log("Client connected to server");
      done();
    });
  });
});

afterAll(() => {
  clientSocket.close();
  server.close();
});

test('should emit userConnected, roomJoined, and updatedPlayerList events after connectUser', (done) => {
  clientSocket.once('userConnected',(data)=>{
    expect(data).toHaveProperty('message','The user has been connected');
  })
  clientSocket.once('roomJoined',({roomId, userId, avatar, username})=>{
    expect(roomId).toBeDefined();
    expect(userId).toBeDefined();
    expect(avatar).toBe('avatar.png'); 
    expect(username).toBe('Timmy'); 
  })
  clientSocket.once('updatedPlayerList', (players) => {
    expect(Array.isArray(players)).toBe(true); 
    done(); 
  });
  
  clientSocket.emit('connectUser', {
    username: 'Timmy',
    avatar: 'avatar.png',
    isPrivate: false,
    privateRoomId: null
  });
});

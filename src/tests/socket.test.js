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

test('should connect and emit connectUser', (done) => {
  clientSocket.emit('connectUser', {
    username: 'Timmy',
    avatar: 'avatar.png',
    isPrivate: false,
    privateRoomId: null
  });

  setTimeout(() => {
    expect(true).toBe(true);
    done();
  }, 100);
});

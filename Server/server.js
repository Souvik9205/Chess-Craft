const express = require('express');
const { Server } = require("socket.io");
const { v4: uuidV4 } = require('uuid');
const http = require('http');



//initialize express:
const app = express();
const server = http.createServer(app);

//set port 8080 to value recieving from ev variable if null
const port = process.env.PORT || 8080 

//http server to websocket server
const io = new Server(server, {
    cors: '*', // allow connection from any origin
});

//io.connect
server.listen(port, () => {
    console.log(`listening on *:${port}`);
});

const rooms = new Map();

io.on('connection', (socket) => {
    console.log(socket.id, 'connected');

    socket.on('username', (username) => {
        console.log(username);
        socket.data.username = username;
    });

    //creating room
    socket.on('createRoom', async (callback) => {
        const roomId = uuidV4();
        await socket.join(roomId);

        rooms.set(roomId, {
            roomId,
            players: [{ id: socket.id, username: socket.data?.username }]
        });

        callback(roomId);
    });

    //joining room
    socket.on('joinRoom', async (args, callback) => {
        
        const room = rooms.get(args.roomId);
        let error, message;
      
        if (!room) { 
          error = true;
          message = 'room does not exist';
        } else if (room.length <= 0) { 
          error = true;
          message = 'room is empty';
        } else if (room.length >= 2) {
          error = true;
          message = 'room is full';
        }

        if (error) {      
            if (callback) { 
              callback({
                error,
                message
              });
            }
      
            return;
        }

        await socket.join(args.roomId);

        const roomUpdate = {
            ...room,
            players: [
              ...room.players,
              { id: socket.id, username: socket.data?.username },
            ],
        };
        rooms.set(args.roomId, roomUpdate);
        callback(roomUpdate);

        socket.to(args.roomId).emit('opponentJoined', roomUpdate);
    });

    socket.on('move', (data) => {
        socket.to(data.room).emit('move', data.move);
    });

    socket.on("disconnect", () => {
        const gameRooms = Array.from(rooms.values()); 

        gameRooms.forEach((room) => { 
          const userInRoom = room.players.find((player) => player.id === socket.id);   
          if (userInRoom) {
            if (room.players.length < 2) {
              rooms.delete(room.roomId);
              return;
            }   
            socket.to(room.roomId).emit("playerDisconnected", userInRoom); 
          }
        });
    });
});
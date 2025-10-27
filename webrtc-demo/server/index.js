const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.json());

const users = {};
const socketToRoom = {};

io.on('connection', (socket) => {
  console.log('新用户连接:', socket.id);

  socket.on('join_room', (data) => {
    const { roomID, userName } = data;
    
    if (users[roomID]) {
      users[roomID].push({ id: socket.id, name: userName });
    } else {
      users[roomID] = [{ id: socket.id, name: userName }];
    }
    
    socketToRoom[socket.id] = roomID;
    const usersInThisRoom = users[roomID].filter(user => user.id !== socket.id);

    socket.emit('all_users', usersInThisRoom);
    socket.to(roomID).emit('user_joined', { id: socket.id, name: userName });
    socket.join(roomID);

    console.log(`用户 ${userName} 加入房间 ${roomID}`);
    console.log(`房间内用户数: ${users[roomID].length}`);
  });

  socket.on('send_signal', (payload) => {
    io.to(payload.userToSignal).emit('user_joined', {
      signal: payload.signal,
      callerID: payload.callerID,
      callerName: payload.callerName
    });
  });

  socket.on('return_signal', (payload) => {
    io.to(payload.callerID).emit('receiving_returned_signal', {
      signal: payload.signal,
      id: socket.id,
      name: payload.name
    });
  });

  socket.on('disconnect', () => {
    const roomID = socketToRoom[socket.id];
    let room = users[roomID];
    
    if (room) {
      room = room.filter(user => user.id !== socket.id);
      users[roomID] = room;
      socket.to(roomID).emit('user_left', socket.id);
      
      if (room.length === 0) {
        delete users[roomID];
      }
    }
    
    delete socketToRoom[socket.id];
    console.log('用户断开连接:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`服务器运行在端口 ${PORT}`);
});
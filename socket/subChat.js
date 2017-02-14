import http       from 'http';
import socketIO   from 'socket.io';

const SUB_CHAT_URL = '/api/socket/sub';

const connect = (server) => {
  const io = socketIO(server, {path: SUB_CHAT_URL});

  io.on('connection', (socket) => {
    console.log('New user connected to SUB chat');
  });
};

module.exports = {
  connect
};

import socketIO       from 'socket.io';
import http           from 'http';
import faker          from 'faker'
import {socketAuth as authenticate} from '../helpers/helper';
import {MainChatRoom} from '../models/mainChat';

const MAIN_CHAT_URL = '/api/socket/main';

const connect = (server) => {
  const io = socketIO(server, {path: MAIN_CHAT_URL});

  io.on('connection', (socket) => {
    console.log('New user connected to MAIN chat');

    // 게시물 번호에 따라서 room이 나뉨.

    /*
      params: {
        tag,
        user: {
          token
        }
      }
    */
    socket.on('join', (params) => {
      // 첫 번째, 토큰 인증 필요.
      // 1. 토큰이 유효하다면, 사용자 아이디이름으로 room 접속
      // 2. 토큰이 유효하지 않거나, 없다면 익명의 사용자로 room 접속
      let {tag, user: { token }} = params;
      let user = authenticate(token);
      let chatter = {
        id: socket.id
      }
      if (!user) {
        // 익명인 경우
        chatter.displayName = faker.internet.userName;
      } else {
        // 유저인 경우
        chatter.displayName = user.displayName;
      }
      // 두 번째, Collection update
      MainChatRoom.addChatter(chatter, tag);

      // Room 입장

    });

    socket.on('disconnect', () => {
      console.log('User was disconnected');

      let {tag, user: { token }} = params;

      MainChatRoom.removeChatter(socket.id, tag);
    });
  });
};

module.exports = {
  connect
};

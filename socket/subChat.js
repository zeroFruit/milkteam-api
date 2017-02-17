import socketIO         from 'socket.io';
import _                from 'lodash';
import {SubChatRoom}    from '../models/subChat';
import {redisClient}    from '../config/redis';
import {isRealString, generateMessage} from '../helpers/helper';

const SUB_CHAT_URL = '/api/socket/sub';
const SUB_CHAT_REDIS_KEY = "sub";

module.exports = (server) => {
  const io = socketIO(server, {path: SUB_CHAT_URL});

  io.on('connection', (socket) => {
    console.log(`${socket.id} connected to Sub chat`);
    /*
      params: {
        lVideoId,
        rVideoId,
        user: {
          token
        }
      }
    */
    socket.on('join', (params) => {
      let {lVideoId, rVideoId, user: {token}} = params;
      let chatter = { id: socket.id };
      let videoId = lVideoId + rVideoId;

      User.findByToken(token).then((user) => {
        if (!user) {
          chatter.displayName = faker.internet.userName;
          chatter.anonymous = true;
        } else {
          chatter.displayName = user.displayName;
          chatter.anonymous = false;
        }


        reidsClient.hget(SUB_CHAT_REDIS_KEY, chatter.id, (err, reply) => {
          if (!reply) {
            redisClient.hmset(SUB_CHAT_REDIS_KEY, chatter.id, videoId);
            socket.join(videoId);
          } else if (reply !== videoId) {
            redisClient.hmset(SUB_CHAT_REDIS_KEY, chatter.id, videoId);
            socket.leave(reply);
            socket.join(videoId);
          }
        });

        SubChatRoom.removeChatter(videoId, chatter).then((out) => {
          SubChatRoom.addChatter(videoId, chatter).then((chatter) => {
            console.log(`${socket.id} || displayName: ${chatter.displayName}`);

            // 왼쪽 채팅 창을 default 로 가정
            socket.emit('lNewMessage', {msg: `[Sub Chat] WELCOME MESSAGE TO ${chatter.diplayName}`});
            socket.broadcast.to(videoId).emit('lNewMessage', {msg: '[Sub Chat] NEW USER ALERT MESSAGE'});

          })
        });
      });
    });
  });

  socket.on('lCreateMessage', (message) => {
    redisClient.hget(SUB_CHAT_REDIS_KEY, socket.id, (err, videoId) => {
      if (!err && videoId && isRealString(message.text)) {
        io.to(videoId).emit('lNewMessage', generateMessage(socket.id, message.text));
      } else {
        console.log(err);
      }
    });
  });

  socket.on('rCreateMessage', (message) => {
    redisClient.hget(SUB_CHAT_REDIS_KEY, socket.id, (err, videoId) => {
      if(!err && videoId && isRealString(message.text)) {
        io.to(videoId).emit('rNewMessage', generateMessage(socket.id, message.text));
      } else {
        console.log(err);
      }
    });
  });

  socket.on('disconnect', (params) => {
    let chatter = { id: socket.id };
    let videoId;

    console.log('[Sub Chat] User was disconnected');

    redisClient.hget(SUB_CHAT_REDIS_KEY, chatter.id, (err, videoId) => {
      if (videoId) {
        redisClient.hdel(SUB_CHAT_REDIS_KEY, chatter.id);

        SubChatRoom.removeChatter(videoId, chatter).then((chatter) => {
          //io.to(videoId).emit()
        });
      }
    });
  });
};

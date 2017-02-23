import socketIO         from 'socket.io';
import _                from 'lodash';
import faker            from 'faker';
import {SubChatRoom}    from '../models/subChat';
import {User}           from '../models/user';
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
      let videoId = lVideoId + rVideoId;
      let chatter = { videoId, id: socket.id };

      User.findByToken(token).then((user) => {
        if (!user) {
          chatter.displayName = faker.internet.userName;
          chatter.anonymous = true;
          chatter.profile = null;
        } else {
          chatter.displayName = user.displayName;
          chatter.anonymous = false;
          chatter.profile = user.profile[0].link;
        }

        let jsonChatterStr = JSON.stringify({videoId, displayName: chatter.displayName, profile: chatter.profile})

        redisClient.hget(SUB_CHAT_REDIS_KEY, socket.id, (err, reply) => {
          if (!reply) {
            redisClient.hmset(SUB_CHAT_REDIS_KEY, socket.id, jsonChatterStr);
            socket.join(videoId);

          } else if (JSON.parse(reply).videoId !== videoId) {
            redisClient.hmset(SUB_CHAT_REDIS_KEY, socket.id, jsonChatterStr);
            socket.leave(JSON.parse(reply).videoId);
            socket.join(videoId);
          }
        });

        SubChatRoom.removeChatter(videoId, chatter).then((out) => {
          SubChatRoom.addChatter(videoId, chatter).then((chatter) => {
            // 왼쪽 채팅 창을 default 로 가정
            socket.emit('lNewMessage', generateMessage(socket.id, 'Welcome', chatter.displayName, chatter.profile));
            socket.broadcast.to(videoId).emit('lNewMessage', generateMessage(socket.id, 'Alert', chatter.displayName, chatter.profile));
          });
        });
      });
    });

    socket.on('lCreateMessage', (message) => {
      redisClient.hget(SUB_CHAT_REDIS_KEY, socket.id, (err, jsonStr) => {
        if (!err && jsonStr && isRealString(message.text)) {
          let {videoId, displayName, profile} = JSON.parse(jsonStr);

          io.to(videoId).emit('lNewMessage', generateMessage(socket.id, message.text, displayName, profile));
          // 채팅 저장
          SubChatRoom.addLeftChat(videoId, {displayName, text: message.text});

        } else {
          // 에러 핸들링, 실수로 join을 안하고 텍스트 전송시...
          console.log(err);
        }
      });
    });

    socket.on('rCreateMessage', (message) => {
      redisClient.hget(SUB_CHAT_REDIS_KEY, socket.id, (err, jsonStr) => {
        if(!err && jsonStr && isRealString(message.text)) {
          let {videoId, displayName, profile} = JSON.parse(jsonStr);

          io.to(videoId).emit('rNewMessage', generateMessage(socket.id, message.text, profile));
          // 채팅 저장
          SubChatRoom.addRightChat(videoId, {displayName, text: message.text});

        } else {
          console.log(err);
        }
      });
    });

    socket.on('disconnect', (params) => {
      let chatter = { id: socket.id };
      let videoId;

      console.log('[Sub Chat] User was disconnected');

      redisClient.hget(SUB_CHAT_REDIS_KEY, chatter.id, (err, jsonStr) => {
        if (jsonStr) {
          let {videoId} = JSON.parse(jsonStr);

          redisClient.hdel(SUB_CHAT_REDIS_KEY, chatter.id);

          SubChatRoom.removeChatter(videoId, chatter).then((chatter) => {
            //io.to(videoId).emit()
          });
        }
      });
    });
  });
};

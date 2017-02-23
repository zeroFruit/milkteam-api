import socketIO       from 'socket.io';
import _              from 'lodash';
import faker          from 'faker'
import {MainChatRoom} from '../models/mainChat';
import {User}         from '../models/user';
import {redisClient}  from '../config/redis';
import {isRealString, generateMessage} from '../helpers/helper';


const MAIN_CHAT_URL = '/api/socket/main';
const MAIN_CHAT_REDIS_KEY = "main";

module.exports = (server) => {
  const io = socketIO(server, {path: MAIN_CHAT_URL});

  io.on('connection', (socket) => {
    console.log(`${socket.id} connected to Main chat`);
    /*
      params: {
        videoId,
        user: {
          token
        }
      }
    */
    socket.on('join', (params) => {
      let {videoId, user: {token}} = params;
      let chatter = { videoId, id: socket.id };
      let oldVideoId;

      User.findByToken(token).then((user) => {
        if (!user) {
          chatter.displayName = faker.internet.userName;
          chatter.anonymous = true;
          chatter.profile = null;
        } else {
          chatter.displayName = user.displayName;
          //chatter.displayName = faker.internet.userName();
          chatter.anonymous = false;
          chatter.profile = user.profile[0].link;
        }

        let jsonChatterStr = JSON.stringify(chatter);

        redisClient.hget(MAIN_CHAT_REDIS_KEY, socket.id, (err, reply) => {
          if (!reply) {
            oldVideoId = videoId; // 처음 채팅입장이므로 chatter 데이터를 사용.
            redisClient.hmset(MAIN_CHAT_REDIS_KEY, socket.id, jsonChatterStr);
            socket.join(videoId);

          } else if (JSON.parse(reply).videoId !== videoId) {
            oldVideoId = JSON.parse(reply).videoId; // 다른 채팅방에서 왔으므로 redis에 저장되어있는 값 사용

            redisClient.hmset(MAIN_CHAT_REDIS_KEY, socket.id, jsonChatterStr);
            socket.leave(oldVideoId); // leave old room
            socket.join(videoId); // join new room
          } else {
            oldVideoId = videoId;
          }

          MainChatRoom.removeChatter(oldVideoId, chatter).then((out) => {
            MainChatRoom.addChatter(videoId, chatter).then((chat) => {
              socket.emit('newMessage', generateMessage(socket.id, "Welcome", chatter.displayName, chatter.profile));
              socket.broadcast.to(videoId).emit('newMessage', generateMessage(socket.id, "Alert", chatter.displayName, chatter.profile));
            }).catch((e) => {
              console.log(e);
            })
          });
        });
      });
    });

    socket.on('createMessage', (message) => {
      redisClient.hget(MAIN_CHAT_REDIS_KEY, socket.id, (err, jsonStr) => {
        if (!err && jsonStr && isRealString(message.text)) {
          let {displayName, videoId, profile} = JSON.parse(jsonStr);

          io.to(videoId).emit('newMessage', generateMessage(socket.id, message.text, displayName, profile));
        } else {
          console.log(err);
        }
      });
    });

    socket.on('disconnect', (params) => {
      let chatter = { id: socket.id };

      console.log(`${socket.id} was disconnected`);

      redisClient.hget(MAIN_CHAT_REDIS_KEY, socket.id, (err, jsonStr) => {
        if (jsonStr) {
          let {videoId, displayName, profile} = JSON.parse(jsonStr);

          redisClient.hdel(MAIN_CHAT_REDIS_KEY, socket.id);
          MainChatRoom.removeChatter(videoId, chatter).then((chatter) => {
            io.to(videoId).emit('createMessage', generateMessage(socket.id, 'Left', displayName, profile));
          });
        }
      });
    });
  });
};

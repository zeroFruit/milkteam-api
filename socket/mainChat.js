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
      let chatter = { id: socket.id };

      User.findByToken(token).then((user) => {

        if (!user) {
          chatter.displayName = faker.internet.userName;
          chatter.anonymous = true;
        } else {
          chatter.displayName = user.displayName;
          //chatter.displayName = faker.internet.userName();
          chatter.anonymous = false;
        }
        redisClient.hget(MAIN_CHAT_REDIS_KEY, chatter.id, (err, reply) => {
          if (!reply) {
            redisClient.hmset(MAIN_CHAT_REDIS_KEY, chatter.id, videoId);
            socket.join(videoId);
          } else if (reply !== videoId) {
            redisClient.hmset(MAIN_CHAT_REDIS_KEY, chatter.id, videoId);
            socket.leave(reply); // leave old room
            socket.join(videoId); // join new room
          }
        });

        MainChatRoom.removeChatter(videoId, chatter).then(() => {
          MainChatRoom.addChatter(videoId, chatter).then((chatter) => {
            console.log(`${socket.id} || displayName: ${chatter.displayName}`);

            socket.emit('newMessage', {msg: `WELCOME MESSAGE TO ${chatter.displayName}`});
            socket.broadcast.to(videoId).emit('newMessage', {msg: 'NEW USER ALERT MESSAGE'});

            //callback();
          });
        });
      });
    });

    socket.on('createMessage', (message) => {
      redisClient.hget(MAIN_CHAT_REDIS_KEY, socket.id, (err, videoId) => {
        if (!err && videoId && isRealString(message.text)) {
          io.to(videoId).emit('newMessage', generateMessage(socket.id, message.text));
        } else {
          console.log(err);
        }
      });
    });

    socket.on('disconnect', (params) => {
      let chatter = { id: socket.id };
      let videoId;

      console.log(`${socket.id} was disconnected`);

      redisClient.hget(MAIN_CHAT_REDIS_KEY, chatter.id, (err, videoId) => {
        if (videoId) {
          redisClient.hdel(MAIN_CHAT_REDIS_KEY, chatter.id);

          MainChatRoom.removeChatter(videoId, chatter).then((chatter) => {
            io.to(videoId).emit('createMessage', {msg: `${chatter.displayName} LEFT`});
          });
        }
      });
    });
  });
};

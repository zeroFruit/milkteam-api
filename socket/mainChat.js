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
    console.log('New user connected to Main chat');
    /*
      params: {
        videoId,
        user: {
          token
        }
      }
    */
    socket.on('join', (params, callback) => {
      let {videoId, user: {token}} = params;
      let chatter = { id: socket.id };

      User.findByToken(token).then((user) => {

        if (!user) {
          chatter.displayName = faker.internet.userName;
          chatter.anonymous = true;
        } else {
          chatter.displayName = user.displayName;
          chatter.anonymous = false;
        }

        socket.join(videoId);

        redisClient.hget(MAIN_CHAT_REDIS_KEY, chatter.id, (err, reply) => {
          if (!reply) {
            redisClient.hmset(MAIN_CHAT_REDIS_KEY, chatter.id, videoId);
          }
        });

        MainChatRoom.removeChatter(videoId, chatter).then(() => {
          MainChatRoom.addChatter(videoId, chatter).then((chatter) => {

            socket.emit('newMessage', {msg: `WELCOME MESSAGE TO ${chatter.displayName}`});
            socket.broadcast.to(videoId).emit('newMessage', {msg: 'NEW USER ALERT MESSAGE'});

            callback();
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

    socket.on('disconnect', (params, callback) => {
      let chatter = { id: socket.id };
      let videoId;

      console.log('User was disconnected');

      redisClient.hget(MAIN_CHAT_REDIS_KEY, chatter.id, (err, reply) => {
        if (reply) {
          videoId = reply;
          redisClient.hdel(MAIN_CHAT_REDIS_KEY, chatter.id);

          MainChatRoom.removeChatter(videoId, chatter).then((chatter) => {
            io.to(videoId).emit('createMessage', {msg: `${chatter.displayName} LEFT`});
          });
        }
      });
    });
  });
};

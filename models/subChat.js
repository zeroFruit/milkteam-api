import {mongoose}     from '../config/mongodb';
import ChatterSchema  from './chatter.Schema';
import ChatSchema     from './chat.Schema';
import _              from 'lodash';

const DEFAULT_GET_CHAT_NUMBER = 100;

const SubChatRoomSchema = new mongoose.Schema({
  videosId: {
    type: String,
    required: true,
    unique: true
  },
  chatters: [ChatterSchema],
  lChat: [ChatSchema],
  rChat: [ChatSchema]
});

SubChatRoomSchema.statics.getLeftChat = function (videoId) {
  let Room = this;

  return Room.findOne({ videoId }).then((room) => {
    return _.takeRight(room.lChat, DEFAULT_GET_CHAT_NUMBER);
  });
}

SubChatRoomSchema.statics.getRightChat = function (videoId) {
  let Room = this;

  return Room.findOne({ videoId }).then((room) => {
    return _.takeRight(room.rChat, DEFAULT_GET_CHAT_NUMBER);
  });
}

SubChatRoomSchema.statics.addLeftChat = function (videoId, chat) {
  let Room = this;

  return Room.findOne({ videoId }).then((room) => {
    room.lChat.push(chat);

    return room.save();
  });
}

SubChatRoomSchema.statics.addRightChat = function (videoId, chat) {
  let Room = this;

  return Room.findOne({ videoId }).then((room) => {
    room.rChat.push(chat);

    return room.save();
  })
}

SubChatRoomSchema.statics.addChatter = function(videoId, chatter) {
  let Room = this;
  return new Promise((resolve, reject) => {
    Room.findOne({ videoId }).then((room) => {
      room.chatters.push(chatter);

      return room.save()
        .then(() => resolve(chatter))
        .catch(reject);
    });
  });
}

SubChatRoomSchema.statics.removeChatter = function(videoId, chatter) {
  let Room = this;

  return new Promise((resolve, reject) => {
    Room.findOne({ videoId }).then((room) => {
      let out = room.chatters.filter((chat) => chat.id === chatter.id);

      if (out.length === 0) {
        return resolve();
      }

      room.chatters.id(out[0]._id).remove();
      return room.save()
        .then(() => resolve(out[0]))
        .catch(reject);
    });
  });
}

const SubChatRoom = mongoose.model('subchat', SubChatRoomSchema);

module.exports = {SubChatRoom};

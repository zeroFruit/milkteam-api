import {mongoose}     from '../config/mongodb';
import ChatterSchema  from './chatter.Schema';

const MainChatRoomSchema = new mongoose.Schema({
  videoId: {
    type: String,
    required: true,
    unique: true
  },
  chatters: [ChatterSchema]
});

// UserSchema.statics.isAnonymous = function (tag, displayName) {
//   let Room = this;
//
//   return Room.findOne({ tag }).then((video) => {
//     let chatter = video.chatters.map((chatter) => chatter.displayName === displayName);
//
//     if (chatter.length === 0) {
//       return true;
//     } else {
//       return false;
//     }
//   });
// }

MainChatRoomSchema.statics.addChatter = function (chatter, videoId) {
  let Room = this;

  return Room.find({ videoId }).then((room) => {
    room.chatters.push(chatter);

    return room.save();
  });
};

MainChatRoomSchema.statics.removeChatter = function (videoId, tag) {
  let Room = this;

  return Room.find({ videoId }).then((room) => {
    room.chatters = room.chatters.map((chat) => chat.id !== id);

    return room.save();
  });
};

const MainChatRoom = mongoose.model('mainchat', MainChatRoomSchema);


module.exports = {MainChatRoom};

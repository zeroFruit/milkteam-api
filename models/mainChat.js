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

MainChatRoomSchema.statics.addChatter = function (videoId, chatter) {
  let Room = this;

  return new Promise((resolve, reject) => {
    Room.findOne({ videoId }).then((room) => {
      
      room.chatters.push(chatter);

      return room.save()
        .then(() => resolve(chatter))
        .catch(reject);
    })
  })
};

MainChatRoomSchema.statics.removeChatter = function (videoId, chatter) {
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
  })
};

const MainChatRoom = mongoose.model('mainchat', MainChatRoomSchema);


module.exports = {MainChatRoom};

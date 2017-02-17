import {mongoose} from '../config/mongodb';
import ChatterSchema from './chatter.Schema';

const SubChatRoomSchema = new mongoose.Schema({
  videoId: {
    type: String,
    required: true,
    unique: true
  },
  chatters: [ChatterSchema]
});

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

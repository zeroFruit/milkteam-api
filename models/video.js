import {mongoose}       from '../config/mongodb';
import {matchingHelper} from '../helpers/helper';
import {Schema}         from 'mongoose';

const VideoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  content: {
    type: String
  },
  videoId: {
    type: String,
    requied: true
  },
  champion: {
    type: String,
    required: true
  },
  position: {
    type: String,
    required: true
  },
  tier: {
    type: String,
    required: true
  },
  attribute: {
    type: String,
    required: true
  },
  matched: {
    type: Boolean,
    default: false
  },
  main: {
    type: Boolean,
    default: false
  },
  user: { // 비디오 소유자
    Schema.Types.ObjectId,
    ref: 'user'
  }
});

VideoShema.statics.getOwner = function (videoId) {
  let video = this;

  return Video.findOne({ videoId }).populate('user').then((video) => {
    return video.user;
  });
}

VideoSchema.statics.match = function (videoId) {
  let Video = this;
  let target, enemy;

  return new Promise((resolve, reject) => {
    Video.find({matched: false}).then((videos) => {
      videos = videos.filter((video) => {
        if (video.videoId === videoId) {
          return true;
        } else {
          target = video;
          return false;
        }
      });
      console.log(videos);
      enemy = matchingHelper(target, videos);

      if(enemy) {
        Video.update({
          $or: [{videoId: enemy.videoId}, {videoId: target.videoId}]
        },{
          $set: {matched: true}
        }).then(() => resolve(enemy))
      } else {
        resolve({});
      }

    }).catch((err) => {
      reject(err);
    })
  });
}

VideoSchema.methods.upload = function() {
  let video = this;

  return new Promise((resolve, reject) => {
    return video.save()
      .then(() => resolve(video))
      .catch((e) => rejct(e));
  });
}

VideoSchema.statics.delete = function(videoId) {
  let Video = this;

  return new Promise((resolve, reject) => {
    Video.findOneAndRemove({ videoId }, null, (err, result) => {
      if (result) {
        resolve(result);
      } else {
        reject();
      }
    });
  });
}

const Video = mongoose.model('video', VideoSchema);

module.exports = {Video};

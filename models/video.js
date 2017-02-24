import {mongoose}       from '../config/mongodb';
import {
  matchingHelper,
  generateVideoData,
  getMainVideoHelper
} from '../helpers/helper';
import {Schema}         from 'mongoose';
import moment           from 'moment-timezone';

const VIDEOS_PER_PAGE = 2;

const VideoSchema = new mongoose.Schema({
  title:      { type: String, required: true },
  desc:       { type: String },
  videoId:    { type: String, requied: true },
  champion:   { type: String, required: true },
  position:   { type: String, required: true },
  tier:       { type: String, required: true },
  attribute:  { type: String, required: true },
  matched:    { type: Boolean, default: false },  // 현재 매칭된 영상이있는지
  views:      { type: Number, default: 0 },
  owner:      { type: Schema.Types.ObjectId },
  match:      { type: Schema.Types.ObjectId, ref: 'match' },
  thumbnail:  { type: String },
  date:       { type: Date, default: Date.now },
  duration:   { type: String }
});

VideoSchema.statics.updateBothMatchProperty = function (videoDocId, enemyVideoDocId, matchDocId) {
  let Video = this;

  return Video.update(
    { $or: [{ _id: videoDocId }, { _id: enemyVideoDocId }] },
    { $set: { match: matchDocId } },
    { multi: true }
  );
}

VideoSchema.statics.getMatchIds = function (videosId) {
  let Video = this;

  Video.find({_id: { $in: videosId } }).then((videos) => {
    return videos.map((video) => {
      return { match: video.match };
    })
  })
}

VideoSchema.statics.getMainVideos = function (page = 0) {
  let Video = this;

  return Video.find({})
    .sort({date: -1})
    .skip(page)
    .limit(VIDEOS_PER_PAGE)
    .then((videos) => Promise.resolve(videos));
}

VideoSchema.statics.getFilteredMainVideos = function (page = 0, character = null, position = null, tier = null) {
  if (character === null || position === null || tier === null) {
    return Promise.reject();
  }

  return Video.find({
    $and: [
      { character:  { $in: character } },
      { position:   { $in: position } },
      { tier:       { $in: tier } }
    ]
  })
  .sort({date: -1})
  .skip(page)
  .limit(VIDEOS_PER_PAGE)
  .then((videos) => Promise.resolve(videos));
}

VideoSchema.statics.getOwner = function (videoId) {
  let Video = this;

  return Video.findOne({ videoId }).then((video) => {
    return video.owner;
  });
}

VideoSchema.statics.match = function (videoId) {
  let Video = this;
  let target, enemy;

  return new Promise((resolve, reject) => {
    Video.find({matched: false}).then((videos) => {
      videos = videos.filter((video) => {
        if (video.videoId !== videoId) {
          return true;
        } else {
          target = video;
          return false;
        }
      });

      enemy = matchingHelper(target, videos);

      if(enemy) {
        Video.update({
          $or: [{videoId: enemy.videoId}, {videoId: target.videoId}]
        }, {
          $set: {matched: true}
        }, {
          multi: true
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
    Video.findOneAndRemove({ videoId }, null, (err, video) => {
      if (video) {
        resolve(generateVideoData(video));
      } else if (err) {
        reject(err);
      } else {
        reject();
      }
    });
  });
}

const Video = mongoose.model('video', VideoSchema);

module.exports = {Video};

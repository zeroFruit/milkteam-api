import {mongoose}     from '../config/mongodb';

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
  }
});

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

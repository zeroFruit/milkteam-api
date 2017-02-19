import {mongoose} from '../config/mongodb';
import {Schema} from 'mongoose';

const MatchSchema = new mongoose.Schema({
  videosId: {
    type: String,
    required: true
  },
  lLikes: {
    type: Number,
    default: 0
  },
  rLikes: {
    type: Number,
    default: 0
  },
  views: {
    type: Number,
    default: 0
  },
  videos: [{
    type: Schema.Types.ObjectId,
    ref: 'video'
  }]
});

MatchSchema.statics.removeWithVideosIds = function(videosIds) {
  let Match = this;

  return Match.remove({videosId: {$in: videosIds}})
    .catch((e) => Promise.reject(e));
}

const Match = mongoose.model('match', MatchSchema);

module.exports = {Match};

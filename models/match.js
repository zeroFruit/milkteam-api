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

const LEFT_LIKES = 'LEFT';
const RIGHT_LIKES = 'RIGHT';

MatchSchema.statics.upLikes = function (videosId, which) {
  let Match = this;

  if (which === LEFT_LIKES) {
    return Match.update({ videosId }, {$inc: { lLikes: 1 } });
  } else if (which === RIGHT_LIKES) {
    return Match.update({ videosId }, {$inc: { rLikes: 1 } });
  }
}

MatchSchema.statics.downLikes = function (videosId, which) {
  let Match = this;

  if (which === LEFT_LIKES) {
    return Match.update({videosId, lLikes: { $gt: 0 }}, {$inc: {lLikes: -1}});
  } else if (which == RIGHT_LIKES) {
    return Match.update({videosId, rLikes: { $gt: 0 }}, {$inc: {rLikes: -1}});
  }
}

MatchSchema.statics.viewed = function (videosId) {
  let Match = this;

  return Match.update({ videosId }, {$inc: {views: 1}});
}

MatchSchema.statics.removeWithVideosIds = function(videosIds) {
  let Match = this;

  return Match.remove({videosId: {$in: videosIds}})
    .catch((e) => Promise.reject(e));
}

const Match = mongoose.model('match', MatchSchema);

module.exports = {Match};

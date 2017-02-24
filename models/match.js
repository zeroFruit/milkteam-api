import {mongoose} from '../config/mongodb';
import {Schema}   from 'mongoose';
import _          from 'lodash';

const MatchSchema = new mongoose.Schema({
  videosId: { type: String, required: true },
  lLikes:   { type: Number, default: 0 },
  rLikes:   { type: Number, default: 0 },
  views:    { type: Number, default: 0 },
  videos:   [{ type: Schema.Types.ObjectId, ref: 'video' }],
  date:     { type: Date, default: Date.now() }
});

const LEFT_LIKES = -1;
const RIGHT_LIKES = 1;

MatchSchema.statics.getMatchesFromIds = function (matchIds) {
  let Match = this;

  return Match.find({ videosId: { $in: matchIds} }).populate('videos').then((matches) => {
    return matches.map((match) => {
      if (match.lLikes > match.rLikes) {
        return {
          videosId: match.videosId,
          lTitle: match.videos[0].title,
          rTitle: match.videos[1].title,
          thumbnail: match.videos[0].thumbnail // 왼쪽 영상 썸네일 링크
        }
      } else {
        return {
          videosId: match.videosId,
          lTitle: match.videos[0].title,
          rTitle: match.videos[1].title,
          thumbnail: match.videos[1].thumbnail // 오른쪽 영상 썸네일 링크
        }
      }
    });
  });
}

MatchSchema.statics.getLatestMatch = function(position, page = 0) {
  let Match = this;

  return Match.find({}).populate('videos').then((matches) => {
    matches = matches.filter((match) => {
      if (match.videos[0].position === position || match.videos[1].position === position) {
        return true;
      } else {
        return false;
      }
    });

    return _.chain(matches)
      .sortBy('date')
      .reverse()
      .drop(page)
      .take(1)
      .value();
  });
}


MatchSchema.statics.upLikes = function (videosId, which) {
  let Match = this;

  return new Promise((resolve, reject) => {
    if (which === LEFT_LIKES) {
      return Match.findOneAndUpdate({ videosId }, {$inc: { lLikes: 1 } }, {new: true}, (err, doc = null) => {
        if (err) {
          reject(err);
        } else if (!doc) {
          reject(-1);
        } else {
          resolve({lLikes: doc.lLikes, rLikes: doc.rLikes});
        }
      });
    } else if (which === RIGHT_LIKES) {
      return Match.findOneAndUpdate({ videosId }, {$inc: { rLikes: 1 } }, {new: true}, (err, doc = null) => {
        if (err) {
          reject(err);
        } else if (!doc) {
          reject(-1);
        } else {
          resolve({lLikes: doc.lLikes, rLikes: doc.rLikes});
        }
      });
    }
  });

}

MatchSchema.statics.downLikes = function (videosId, which) {
  let Match = this;

  return new Promise((resolve, reject) => {
    if (which === LEFT_LIKES) {
      return Match.findOneAndUpdate({ videosId, lLikes: { $gt: 0 } }, {$inc: { lLikes: -1 } }, {new: true}, (err, doc = null) => {
        if (err) {
          reject(err);
        } else if (!doc) {
          resolve();
        } else {
          resolve({lLikes: doc.lLikes, rLikes: doc.rLikes})
        }
      });
    } else if (which === RIGHT_LIKES) {
      return Match.findOneAndUpdate({ videosId, rLikes: { $gt: 0 } }, {$inc: { rLikes: -1 } }, {new: true}, (err, doc = null) => {
        if (err) {
          reject(err);
        } else if (!doc) {
          resolve();
        } else {
          resolve({lLikes: doc.lLikes, rLikes: doc.rLikes});
        }
      });
    }
  });
}

MatchSchema.statics.viewed = function (videosId) {
  let Match = this;

  return new Promise((resolve, reject) => {
    return Match.findOneAndUpdate({ videosId }, {$inc: {views: 1}}, {new: true}, (err, doc) => {
      if (err) {
        reject(err);
      }
      resolve(doc.views);
    });
  });
}

MatchSchema.statics.removeWithVideosIds = function(videosIds) {
  let Match = this;

  return Match.remove({videosId: {$in: videosIds}})
    .catch((e) => Promise.reject(e));
}

const Match = mongoose.model('match', MatchSchema);

module.exports = {Match};

import _      from 'lodash';
import {User} from '../models/user';


const responseByCode = (res, code, status = 200) => {
  res.status(status).json({code});
}

const isRealString = (str) => {
  return typeof str === 'string' && str.trim().length > 0;
};

const generateMessage = (from, msg) => {
  return { from, msg };
};

const YouTubeGetID = (url) => {
  let ID = '';
  url = url.replace(/(>|<)/gi,'').split(/(vi\/|v=|\/v\/|youtu\.be\/|\/embed\/)/);
  if(url[2] !== undefined) {
    ID = url[2].split(/[^0-9a-z_\-]/i);
    ID = ID[0];
  }
  else {
    ID = url;
  }
    return ID;
};

const matchingHelper = (target, videos) => {
  // const CHAMPION_WEIGHT = 1;
  // const POSITION_WEIGHT = 1;
  // const TIER_WEIGHT = 1;
  console.log('Before match', videos);
  videos = videos.filter((video) => {
    let point = 0;
    if (video.champion === target.champion) point++;
    if (video.position === target.position) point++;
    if (video.tier === target.tier) point++;

    if (point >= 2) {
      video.points = point;
      return true;
    } else {
      return false;
    }
  });
  console.log(videos);

  return _.max(videos, _.property('points'))
};


module.exports = {
  responseByCode,
  isRealString,
  generateMessage,
  YouTubeGetID,
  matchingHelper
}

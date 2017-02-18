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
  if(!target) {
    return undefined;
  }
  videos = videos.filter((video) => {
    let point = 0;
    if (video.champion === target.champion) point++;
    if (video.position === target.position) point++;
    if (video.tier === target.tier) point++;

    video.points = point;

    if (point >= 2) {
      return true;
    } else {
      return false;
    }
  });

  if(videos.length === 0) {
    return undefined;
  }

  return _.max(videos, _.property('points'))
};

/*
  http 응답시 _id 를 제외한 데이터만 추출해서 object형태로 리턴
*/
const generateVideoData = (video) => {
  return _.pick(video, ['title', 'content', 'videoId', 'owner', 'matched', 'main']);
};

const NUMBER_OF_MAIN_VIDEOS = 5;

const getMainVideoHelper = (preference, videos) => {

  let {character, position, tier} = preference;

  videos = videos.filter((video) => {
    let point = 0;
    if (video.character === character) point++;
    if (video.position === position) point++;
    if (video.tier === tier) point++;
    video.points = point;

    return true;
  });

  return _.takeRight(_.sortBy(videos, 'points').reverse(), NUMBER_OF_MAIN_VIDEOS).reverse();
  //return _.max(videos, _.property('points'));
};


module.exports = {
  NUMBER_OF_MAIN_VIDEOS,
  responseByCode,
  isRealString,
  generateMessage,
  YouTubeGetID,
  matchingHelper,
  generateVideoData,
  getMainVideoHelper
}

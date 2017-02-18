import {server}         from '../app';
import Code             from '../config/responseCode';
import {responseByCode, getMainVideoHelper} from '../helpers/helper';
import _                from 'lodash';
import {Video}          from '../models/video';
import {User}           from '../models/user';
import {Match}          from '../models/match';
import {alarmIO}        from '../socket/alarm';

async function getMainVideoByPreference (req, res) {
  try {
    let videos = await Video.getVideos();
    let mainVideos = getMainVideoHelper(req.query, videos);

    //메인 비디오 main 속성 업데이트 추가하기

    res.json({code: Code.GET_VIDEO_SUCCESS, data: mainVideos});
  } catch (e) {
    console.log(e);
    responseByCode(res, Code.GET_VIDEO_FAIL, 400);
  }
}

async function getVideos (req, res) {
  try {
    let videos = await User.getVideos(req.user._id);

    res.json({code: Code.GET_VIDEO_SUCCESS, data: videos});
  } catch (e) {
    responseByCode(res, Code.GET_VIDEO_FAIL, 400);
  }
}

async function uploadVideo (req, res) {
  let body = _.pick(req.body, ['video']);
  body.video = _.assign(body.video, {owner: req.user._id});

  let video = new Video(body.video);

  try {
    await req.user.uploadVideo(video);
    await video.upload();

    let enemyVideo = await Video.match(video.videoId);

    if (_.isEmpty(enemyVideo)) { // 기준에 맞는 대결 영상이 없는 경우
      return res.json({code: Code.POST_VIDEO_SUCCESS, data: {video}});
    }

    let match = new Match({videosId: video.videoId + enemyVideo.videoId});
    match.videos.push(video);
    match.videos.push(enemyVideo);
    await match.save();

    let enemyId = await Video.getOwner(enemyVideo.videoId);
    //alarmIO(server, video.videoId, req.user._id, enemy.videoId, enemyId);

    res.json({code: Code.POST_VIDEO_SUCCESS, data: {video, enemy}});
  } catch (e) {
    console.log(e);
    responseByCode(res, Code.POST_VIDEO_FAIL, 400);
  }
}

async function deleteVideo (req, res) {
  let videoId = req.body.videoId;

  try {
    await req.user.deleteVideo(videoId);
    let video = await Video.delete(videoId);

    res.json({code: Code.DELETE_VIDEO_SUCCESS, data: video});
  } catch (e) {
    responseByCode(res, Code.DELETE_VIDEO_FAIL, 400);
  }
}

module.exports = {
  getMainVideoByPreference,
  getVideos,
  uploadVideo,
  deleteVideo
};

import {server}         from '../app';
import Code             from '../config/responseCode';
import {responseByCode} from '../helpers/helper';
import _                from 'lodash';
import {Video}          from '../models/video';
import {User}           from '../models/user';
import {Match}          from '../models/match';
import {alarmIO}        from '../socket/alarm';
import {redisClient}    from '../config/redis';

const USER_SOCKETID_MAPPER = 'userSocketIdMapper';

async function getVideos (req, res) {
  try {
    let videos = await User.getVideos(req.user._id);

    res.json({code: Code.GET_VIDEO_SUCCESS, data: videos});
  } catch (e) {
    responseByCode(res, Code.GET_VIDEO_FAIL, 400);
  }
}

function uploadVideo (io) {
  return async function(req, res) {
    let body = _.pick(req.body, ['video']);
    body.video = _.assign(body.video, {owner: req.user._id});

    let video = new Video(body.video);

    try {
      await req.user.uploadVideo(video);
      await video.upload();

      let enemyVideo = await Video.match(video.videoId);

      if (_.isEmpty(enemyVideo)) {
        return res.json({code: Code.POST_VIDEO_SUCCESS, data: {video}});
      }

      let match = new Match({videosId: video.videoId + enemyVideo.videoId});
      match.videos.push(video);
      match.videos.push(enemyVideo);
      await match.save();

      let enemyId = await Video.getOwner(enemyVideo.videoId);
      //alarmIO(server, video.videoId, req.user._id, enemy.videoId, enemyId);
      // mongodb에 user부분에 notify 저장
      // 알람 푸시
      redisClient.hget(USER_SOCKETID_MAPPER, enemyId, (err, reply) => {
        // 현재 접속해 있을때만 push notify
        if (reply) {
          io.sockets.socket(reply).emit('videoMatched', {message: '회원님의 매드무비가 대결영상에 올라왔습니다!'});
        }
        
      })

      res.json({code: Code.POST_VIDEO_SUCCESS, data: {video, enemy}});
    } catch (e) {
      console.log(e);
      responseByCode(res, Code.POST_VIDEO_FAIL, 400);
    }
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
  getVideos,
  uploadVideo,
  deleteVideo
};

import {server}         from '../app';
import Code             from '../config/responseCode';
import {
  responseByCode,
  getMainVideoHelper,
  removeMatchesWithVideoId
} from '../helpers/helper';
import _                from 'lodash';
import {Video}          from '../models/video';
import {User}           from '../models/user';
import {Match}          from '../models/match';
import {MainChatRoom}       from '../models/mainChat';
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


// user 컨트롤러 옮기기
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
  let mainChat = new MainChatRoom({videoId: body.video.videoId});
  // 메인화면 채팅창 등록하기

  try {
    await req.user.uploadVideo(video);
    video = await video.upload();
    await mainChat.save();

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
    //await req.user.deleteVideo(videoId); // 유저의 영상 목록에서 삭제
    let matches = await Match.find({}).populate('videos'); // Match Collection에서 삭제
    let videosIds = removeMatchesWithVideoId(matches, videoId);
    await Match.removeWithVideosIds(videosIds);

    // 메인화면 채팅 삭제
    await MainChatRoom.remove({ videoId });

    let video = await Video.delete(videoId); // 영상 Collection에서 삭제

    res.json({code: Code.DELETE_VIDEO_SUCCESS, data: video});
  } catch (e) {
    if (e) {
      console.log(e);
      responseByCode(res, Code.DELETE_VIDEO_FAIL, 400);
    } else {
      responseByCode(res, Code.VIDEO_NOT_FOUND, 400);
    }
  }
}

module.exports = {
  getMainVideoByPreference,
  getVideos,
  uploadVideo,
  deleteVideo
};

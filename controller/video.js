import _                from 'lodash';
import qs               from 'qs';
import {server}         from '../app';
import Code             from '../config/responseCode';
import {
  responseByCode,
  getMainVideoHelper,
  removeMatchesWithVideoId,
  generateVideoData
} from '../helpers/helper';
import {getThumbnailFromId, getYTDuration} from '../helpers/youtubeHelper';
import {Video}          from '../models/video';
import {User}           from '../models/user';
import {Match}          from '../models/match';
import {MainChatRoom}   from '../models/mainChat';
import {SubChatRoom}    from '../models/subChat';
import {alarmIO}        from '../socket/alarm';

/*
  character, position, tier, customed, page
*/
async function getMainVideoByPreference (req, res) {
  let {character, position, tier, page, customed} = req.query;
  let videos;

  try {
    page = parseInt(page);
    
    if (!customed) {
      videos = await Video.getMainVideos(page);

    } else {
      videos = await Video.getFilteredMainVideos(page, character, position, tier);
    }

    videos = videos.map((video) => generateVideoData(video));

    res.json({
      code: Code.GET_VIDEO_SUCCESS,
      data: {
        videos
      }
    });
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
    console.log(e);
    responseByCode(res, Code.GET_VIDEO_FAIL, 400);
  }
}

/*
  1. 영상 업로드
  2. 메인화면 채팅 모델 생성

*/
async function uploadVideo (req, res) {
  let body = _.pick(req.body, ['video']);

  // 썸네일 링크 가져오기
  let thumbnail = await getThumbnailFromId(body.video.videoId);
  let duration = await getYTDuration(body.video.videoId);

  body.video = _.assign(body.video, { owner: req.user._id, thumbnail, duration });

  let video = new Video(body.video);
  let mainChat = new MainChatRoom({videoId: body.video.videoId});
  // 메인화면 채팅창 등록하기

  try {
    await req.user.uploadVideo(video);
    video = await video.upload();
    await mainChat.save();

    let enemyVideo = await Video.match(video.videoId);

    if (_.isEmpty(enemyVideo)) { // 기준에 맞는 대결 영상이 없는 경우
      return res.json({
        code: Code.POST_VIDEO_SUCCESS,
        data: {
          video: generateVideoData(video)
        }
      });
    }

    let match = new Match({
      videosId: video.videoId + enemyVideo.videoId,
      videos: [video, enemyVideo]
    });

    await match.save();
    await Video.updateBothMatchProperty(video._id, enemyVideo._id, match._id); // 두 비디오의 match 에 id 업데이트.
    let subChat = new SubChatRoom({ videosId: video.videoId + enemyVideo.videoId });
    await subChat.save();
    let enemyId = await Video.getOwner(enemyVideo.videoId);
    //alarmIO(server, video.videoId, req.user._id, enemy.videoId, enemyId);

    res.json({
      code: Code.POST_VIDEO_SUCCESS,
      data: {
        video: generateVideoData(video),
        enemyVideo: generateVideoData(enemyVideo)
      }
    });
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

import Code             from '../config/responseCode';
import {responseByCode} from '../helpers/helper';
import _                from 'lodash';
import {Video}          from '../models/video';
import {User}           from '../models/user';

async function uploadVideo (req, res) {
  let body = _.pick(req.body, ['video']);
  let video = new Video(body.video);

  try {
    let user = await User.findById(req.user._id);
    await user.uploadVideo(video);
    await video.upload();

    res.json({code: Code.POST_VIDEO_SUCCESS, data: video});
  } catch (e) {
    responseByCode(res, Code.POST_VIDEO_FAIL, 400);
  }
}

async function deleteVideo (req, res) {
  let videoId = req.body.videoId;

  try {
    let user = await User.findById(req.user._id);
    await user.deleteVideo(videoId);
    let video = await Video.delete(videoId);

    res.json({code: Code.DELETE_VIDEO_SUCCESS, data: video});
  } catch (e) {
    responseByCode(res, Code.DELETE_VIDEO_FAIL, 400);
  }
}

module.exports = {
  uploadVideo,
  deleteVideo
};

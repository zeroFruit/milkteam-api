import {authenticate} from '../middlewares/authenticate';
import videoController from '../controller/video';

const router = (app, io) => {
  app.get('/video', authenticate, videoController.getVideos);
  app.post('/video', authenticate, videoController.uploadVideo(io));
  app.delete('/video', authenticate, videoController.deleteVideo);
}

module.exports = router;

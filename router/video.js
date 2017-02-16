import {authenticate} from '../middlewares/authenticate';
import videoController from '../controller/video';

const router = (app) => {
  app.get('/video', authenticate, videoController.getVideos);
  app.post('/video', authenticate, videoController.uploadVideo);
  app.delete('/video', authenticate, videoController.deleteVideo);
}

module.exports = router;

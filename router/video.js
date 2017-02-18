import videoController from '../controller/video';
import {authenticate, checkTokenAndPass} from '../middlewares/authenticate';
import {customize} from '../middlewares/customize';

const router = (app) => {
  app.get('/video', authenticate, videoController.getVideos);
  app.post('/video', authenticate, videoController.uploadVideo);
  app.delete('/video', authenticate, videoController.deleteVideo);

  app.get('/video/main', checkTokenAndPass, customize, videoController.getMainVideoByPreference);
}

module.exports = router;

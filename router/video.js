import {authenticate} from '../middlewares/authenticate';
import videoController from '../controller/video';

const router = (app) => {
  app.post('/video', authenticate, videoController.uploadVideo);
  app.delete('/video', authenticate, videoController.deleteVideo);
}

module.exports = router;

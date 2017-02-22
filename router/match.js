import matchController from '../controller/match';
import {authenticate} from '../middlewares/authenticate';

const router = (app) => {
  app.put('/match/likes', authenticate, matchController.updateLikes);
  app.put('/match/views', matchController.updateViews);
}

module.exports = router;

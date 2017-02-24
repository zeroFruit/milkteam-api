import matchController from '../controller/match';
import {authenticate, checkTokenAndPass} from '../middlewares/authenticate';

const router = (app) => {
  app.put('/match/likes', authenticate, matchController.updateLikes);
  app.put('/match/views', matchController.updateViews);
  app.get('/match', checkTokenAndPass, matchController.getFilteredMatches);
  app.get('/match/history', authenticate, matchController.getMatchHistory);
  app.get('/match/:id', authenticate, matchController.getMatchById);
}

module.exports = router;

import userRouter from './user';
import videoRouter from './video';
import chatRouter from './chat';
import matchRouter from './match';

const set = (app) => {
  userRouter(app);
  videoRouter(app);
  chatRouter(app);
  matchRouter(app);
}

module.exports = set;

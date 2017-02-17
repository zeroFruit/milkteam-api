import userRouter from './user';
import videoRouter from './video';
import chatRouter from './chat';

const set = (app) => {
  userRouter(app);
  videoRouter(app);
  chatRouter(app);
}

module.exports = set;

import userRouter from './user';
import videoRouter from './video';

const set = (app) => {
  userRouter(app);
  videoRouter(app);
}

module.exports = set;

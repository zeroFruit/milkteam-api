import userRouter from './user';
import videoRouter from './video';
import chatRouter from './chat';

const set = (app, io) => {
  userRouter(app);
  videoRouter(app, io);
  chatRouter(app);
}

module.exports = set;

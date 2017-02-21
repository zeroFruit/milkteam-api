import userRouter from './user';
import videoRouter from './video';
import chatRouter from './chat';
import alarmRouter from './alarm';

const set = (app) => {
  userRouter(app);
  videoRouter(app);
  chatRouter(app);
  alarmRouter(app);
}

module.exports = set;

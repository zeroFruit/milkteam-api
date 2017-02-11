import userRouter from './user';

const set = (app) => {
  userRouter(app);
}

module.exports = set;

import Start from '../controller/index';

const router = (app) => {
  app.get('/', Start.helloWorld);
};

module.exports = router;

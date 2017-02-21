import {authenticate} from '../middlewares/authenticate';
import alarmController from '../controller/alarm';

const router = (app) => {
  app.get('/alarms', authenticate, alarmController.getAlarms);
}

module.exports = router;

//import Start from '../controller/index';
import {ObjectID} from 'mongodb';
import {mongoose} from '../config/mongodb';
import userController from '../controller/user';
import {authenticate} from '../middlewares/authenticate';

const router = (app) => {
  app.post('/users', userController.addUser);
  app.post('/users/login', userController.loginUser);
  app.delete('/users/me/token', authenticate, userController.logoutUser);
  app.get('/users', authenticate, userController.getUser);

  app.get('/users/displayname/doublecheck', authenticate, userController.displayNameDoubleCheck);
  app.put('/users/displayname', authenticate, userController.updateDisplayName);

  app.post('/users/profile', authenticate, userController.uploadProfileImg);
};

module.exports = router;

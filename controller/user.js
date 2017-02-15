import Code             from '../config/responseCode';
import {responseByCode} from '../helpers/helper';
import _                from 'lodash';
import {User}           from '../models/user';

async function addUser (req, res) {
  let body = _.pick(req.body, ['email', 'password', 'displayName']);
  let user = new User(body);

  try {
    await user.save();
    let token = await user.generateAuthToken();

    res.header('x-auth', token).json({code: Code.POST_USER_SUCCESS, data: user});
  } catch (e) {
    responseByCode(res, Code.POST_USER_FAIL, 400);
  }
}

async function loginUser (req, res) {
  let body = _.pick(req.body, ['email', 'password']);

  try {
    let user = await User.findByCredentials(body.email, body.password);
    let token = await user.generateAuthToken();

    res.header('x-auth', token).json({code: Code.POST_USER_LOGIN_SUCCESS});
  } catch (e) {
    responseByCode(res, Code.POST_USER_LOGIN_FAIL, 400);
  }
}

async function logoutUser (req, res) {
  try {
    await req.user.removeToken(req.token);

    responseByCode(res, Code.DELETE_USER_SUCCESS, 200);
  } catch (e) {
    responseByCode(res, Code.DELETE_USER_FAIL, 400);
  }
}

module.exports = {
  addUser,
  loginUser,
  logoutUser
}

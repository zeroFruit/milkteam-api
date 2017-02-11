import {User}           from '../models/user';
import Code             from '../config/responseCode';
import {responseByCode} from '../helpers/helper';

async function authenticate (req, res, next) {
  let token = req.header('x-auth');

  try {
    let user = await User.findByToken(token);

    if (!user) {
      return Promise.reject();
    }
    req.user = user;
    req.token = token;
    next();
  } catch (e) {
    responseByCode(res, Code.AUTHENTICATE_FAIL, 401);
  }
}

module.exports = {authenticate};

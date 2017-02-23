import {User} from '../models/user';
import Code from '../config/responseCode';
import {responseByCode} from '../helpers/helper';

async function displayNameDoubleCheck (req, res, next) {
  try {
    let user = await User.findOne({displayName: req.user.displayName});
    if (user) {
      return Promise.reject();
    }
    next();
  } catch (e) {
    res.json({code: Code.DOUBLE_CHECK_FAIL});
  }


}

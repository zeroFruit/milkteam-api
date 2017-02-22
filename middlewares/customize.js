import {User}           from '../models/user';
import Code             from '../config/responseCode';
import {responseByCode} from '../helpers/helper';

async function customize (req, res, next) {
  if (req.user && req.token) {
    // 사용자 커스터마이징 저장
    await req.user.updatePreference(req.query);

    return next();
  }
  next();
}

module.exports = {customize};

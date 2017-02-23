import Code             from '../config/responseCode';
import {responseByCode} from '../helpers/helper';
import _                from 'lodash';
import {User}           from '../models/user';

async function getAlarms (req, res) {
  try {
    let alarms = await User.getAlarms(req.user._id);

    res.json({code: Code.GET_ALARMS_SUCCESS, data: alarms});
  } catch (e) {
    console.log(e);
    responseByCode(res, Code.GET_ALARMS_FAIL, 400);
  }
}

module.exports = {
  getAlarms
}

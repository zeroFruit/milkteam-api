import Code             from '../config/responseCode';
import {responseByCode} from '../helpers/helper';

async function helloWorld (req, res) {
  res.json({code: Code.SUCCESS, data: "hello world"});
  //res.send('hello');
}

module.exports = {
  helloWorld
}

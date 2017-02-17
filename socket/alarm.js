import socketIO     from 'socket.io';
import {User}       from '../models/user';
import {Video}      from '../models/video';
import {redisClient} from '../config/redis';

const ALARM_URL = '/api/socket/alarm';
const ALARM_REDIS_KEY = "alarm";

module.exports (server, ownerVideoId, ownerId, enemyVideoId, enemyId) => {
  const io = socketIO(server, {path: ALARM_URL});

  // code here
}

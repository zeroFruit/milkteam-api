import {redisClient}  from '../config/redis';

const VIDEO_HISTORY_REIDS_KEY = "history";
const NUMBER_OF_HISTORY = 10;

const setHistory = (userId, matchId) => {
  const key   = `${VIDEO_HISTORY_REIDS_KEY}:${userId}`;
  const value = `${Date.now()}-${matchId}`;

  return new Promise((resolve, reject) => {
    redisClient.exists(key, (err, reply) => {
      if (err) {
        return reject(err);
      } else {
        redisClient.lpush(key, value);
        return resolve();
      }
    });
  });
}

const getHistory = (userId) => {
  const key = `${VIDEO_HISTORY_REIDS_KEY}:${userId}`;

  return new Promise((resolve, reject) => {
    redisClient.lrange(key, 0, NUMBER_OF_HISTORY-1, (err, reply) => {
      if (err) {
        return reject(err);
      }
      return resolve(reply);
    });
  });
}

const removeHistory = (userId) => {
  const key = `${VIDEO_HISTORY_REIDS_KEY}:${userId}`;

  return new Promise((resolve, reject) => {
    redisClient.del(key, (err, reply) => {
      if (err) {
        return reject(err);
      }

      return resolve();
    });
  });
}

module.exports = {
  setHistory,
  getHistory,
  removeHistory
}

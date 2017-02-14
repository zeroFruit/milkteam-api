import './env/env';
import redis from 'redis';

const redisClient = redis.createClient({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT
});

redisClient.on('ready', () => {
  console.log('Redis is ready');
});

redisClient.on('error', (err) => {
  console.log(err);
});

module.exports = { redisClient };

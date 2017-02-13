import redis from 'redis';

const redisClient = redis.createClient({
  host: 'localhost',
  port: 6379
});

redisClient.on('ready', () => {
  console.log('Redis is ready');
});

redisClient.on('error', () => {
  console.log('Error in Redis');
});

module.exports = { redisClient };

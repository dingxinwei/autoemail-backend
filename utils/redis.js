const redis = require('redis');
const logger = require('../logs/logger');

const client = redis.createClient(6379, '192.168.1.53'); // 端口号、主机
// 配置redis的监听事件
// 准备连接redis-server事件
client.on('ready', () => {
  logger.info('Redis client: ready');
});

// 连接到redis-server回调事件
client.on('connect', () => {
  logger.info('redis is now connected!');
});

client.on('reconnecting', () => {
  logger.info('redis reconnecting');
});

client.on('end', () => {
  logger.info('Redis Closed!');
});

client.on('warning', () => {
  logger.warn('Redis client: warning');
});

client.on('error', (err) => {
  logger.error(`Redis Error ${err}`);
});

// 导出redis-client对象
module.exports = {
  client,
};

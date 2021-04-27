// 引用redisClient对象
const redisClient = require('./redis');

/**
 * redis setString function
 * @param key
 * @param value
 * @param expire
 */
const setString = (key, value, expire) => new Promise((resolve, reject) => {
  redisClient.client.set(key, value, (err, result) => {
    if (err) {
      reject(err);
      return;
    }
    redisClient.client.expire(key, expire);
    resolve(result);
  });
});

/**
* redis getString function
* @param key
*/
const getString = (key) => new Promise((resolve, reject) => {
  redisClient.client.get(key, (err, result) => {
    if (err) {
      reject(err);
      return;
    }
    resolve(result);
  });
});

/**
* redis removeString function
* @param key
*/
const removeString = (key) => new Promise((resolve, reject) => {
  redisClient.client.get(key, (err, result) => {
    if (err) {
      reject(err);
      return;
    }
    redisClient.client.expire(key, -1);
    resolve(result);
  });
});
const rpushList = (key, value, expire) => new Promise(() => {
  redisClient.client.lpush(key, value);
  redisClient.client.expire(key, expire);
});
const lrangeList = (key, start, end) => new Promise((resolve, reject) => {
  redisClient.client.lrange(key, start, end, (err, result) => {
    if (err) {
      reject(err);
      return;
    }
    resolve(result);
  });
});
const delKey = (key) => new Promise(() => {
  redisClient.client.del(key);
});
module.exports = {
  getString,
  setString,
  removeString,
  rpushList,
  lrangeList,
  delKey,
};

const mysql = require('mysql');
const $conf = require('../config/db.js');

const pool = mysql.createPool($conf.mysql);
const sql = require('../config/sql');
const logger = require('../logs/logger');
const redisClient = require('../utils/redisClient');

function updateEmailStatus(id, status) {
  pool.getConnection((err, connection) => {
    if (err) {
      logger.error(`获取连接失败[${err}]`);
      return;
    }
    connection.query(sql.email.updateEmailStatus, [status, id], (error) => {
      if (error) {
        logger.error(`[id=${id}] 邮件状态更新失败,[status=${status}]`);
      } else {
        logger.info(`[id=${id}] 邮件状态更新成功,[status=${status}]`);
      }
    });
    connection.release();
  });
}
function selectTodayEmail(dateStr) {
  pool.getConnection((err, connection) => {
    if (err) {
      logger.error(`获取连接失败[${err}]`);
      return;
    }
    connection.query(sql.email.selectTodayEmail, dateStr, (error, result) => {
      if (error) {
        logger.error(`[邮件查询失败[日期：${dateStr}] [${error}]`);
      } else {
        logger.info(`邮件查询成功[日期：${dateStr}]`);
        if (Array.isArray(result)) {
          result.forEach((element) => {
            redisClient.rpushList(dateStr.substring(0, dateStr.indexOf(' ')), JSON.stringify(element), 60 * 60 * 24);
          });
        } else {
          redisClient.setString(result.id, JSON.stringify(result), 60 * 60 * 24);
        }
      }
    });
    connection.release();
  });
}

function createEmail(data) {
  return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if (err) {
        logger.error(`获取连接失败[${err}]`);
        return;
      }
      const dataArray = Object.values(data);
      dataArray.push(0);
      connection.query(sql.email.createEmail, dataArray, (error) => {
        if (err) {
          logger.error(`[id=${dataArray[dataArray.length - 2]}] 邮件创建失败[原因:${error}]`);
          reject(err);
        } else {
          logger.info(`[id=${dataArray[dataArray.length - 2]}] 邮件创建成功`);
          resolve();
        }
      });
      connection.release();
    });
  });
}
module.exports = {
  createEmail,
  updateEmailStatus,
  selectTodayEmail,
};

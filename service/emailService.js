const UUID = require('uuidjs');
const email = require('../utils/emailAuto');
const schedule = require('../utils/schedule');
const emailDao = require('../dao/emailDao');
const dateUtils = require('../utils/date');
const redisClient = require('../utils/redisClient');
const logger = require('../logs/logger');

function createEmailAndScheduleJob(req, res) {//创建邮件，如果日期是今天则加入到定时任务
  const {
    sendDate, fromEmail, toEmail, emailSubject, emailContent, password,
  } = req.body;
  if (!sendDate || !fromEmail || !toEmail || !emailSubject || !emailContent || !password) {
    logger.error(
      `[sendDate=${sendDate},fromEmail=${fromEmail},toEmail=${toEmail},emailSubject=${emailSubject},emailContent=${emailContent},password=${password}] 请求参数错误`,
    );
    res.json({ code: 402, message: '请求参数错误' });
    return;
  }
  const date = new Date(Date.parse(req.body.sendDate));
  const currentDate = new Date();
  req.body.sendDate = dateUtils.transformDate(req.body.sendDate);
  req.body.uuid = UUID.generate();
  if (date < currentDate) {
    logger.error(`[id=${req.body.uuid}] 日期无效`);
    res.json({ code: 401, message: '日期无效' });
  } else {
    if (date.toDateString() === currentDate.toDateString()) { // 今天的任务
      schedule.setSchedule(`${date.getSeconds()} ${date.getMinutes()} ${date.getHours()} ${date.getDate()} ${date.getMonth() + 1} *`, () => {
        email.sendEmail(req.body, (status) => {
          // 邮件发送后操作数据库标识任务完成或失败
          redisClient.getString(req.body.uuid).then((result) => {
            const emailData = JSON.parse(result);
            Object.defineProperty(emailData, 'emailStatus', {
              value: status,
              writable: true,
              enumerable: true,
            });

            redisClient.setString(req.body.uuid, JSON.stringify(emailData));
          });
          emailDao.updateEmailStatus(req.body.uuid, status);
        });
      });
      redisClient.setString(req.body.uuid, JSON.stringify(req.body), 60 * 60 * 24);// 有效期一天
    }

    // 存到数据库中
    emailDao.createEmail(req.body).then(() => {
      res.json({ code: 200, message: '邮件创建成功' });
    }).catch(() => {
      res.json({ code: 400, message: '邮件创建失败' });
    });
  }
}
function scheduleSelectEmail() {
  schedule.setSchedule('0 0 0 * * *', () => { // 每天凌晨12点查询当天要发送邮件
    const currentDate = new Date();
    const dateStr = dateUtils.transformDate(currentDate.toDateString());
    emailDao.selectTodayEmail(dateStr);
  });
}
function selectEmailWithOneHour() { // 每小时整 查询当前小时要发送的邮件
  schedule.setSchedule('0 0 * * * *', () => { //
    const currentDate = new Date();
    const dateStr = dateUtils.transformDateToYearMonthDay(currentDate.toDateString());
    redisClient.lrangeList(dateStr, 0, -1).then((result) => {
      if (Array.isArray(result)) {
        result.forEach((element, index) => {
          const emailData = JSON.parse(element);
          const sendDate = new Date(emailData.send_date);
          if (sendDate.getHours() === currentDate.getHours()) {
            schedule.setSchedule(`${sendDate.getSeconds()} ${sendDate.getMinutes()} ${sendDate.getHours()} ${sendDate.getDate()} ${sendDate.getMonth() + 1} *`, () => {
              email.sendEmail(emailData, (status) => {
                Object.defineProperty(emailData, 'email_status', {
                  value: status,
                  writable: true,
                  enumerable: true,
                });
                // eslint-disable-next-line no-param-reassign
                result[index] = JSON.stringify(emailData);
                redisClient.delKey(dateStr);
                result.forEach((item) => {
                  redisClient.rpushList(dateStr, JSON.stringify(item), 60 * 60 * 24);
                });
              });
            });
          }
        });
      }
    });
  });
}
function updateRedisDataToDatabase() { // 定时把redis中的数据同步到数据库中
  schedule.setSchedule('0 59 23 * * *', () => {
    const currentDate = new Date();
    const dateStr = dateUtils.transformDateToYearMonthDay(currentDate.toDateString());
    redisClient.lrangeList(dateStr, 0, -1).then((result) => {
      if (Array.isArray(result)) {
        result.forEach((element) => {
          const { id, email_status } = JSON.parse(element);
          emailDao.updateEmailStatus(id, email_status);
        });
      } else {
        const { id, email_status } = JSON.parse(result);
        emailDao.updateEmailStatus(id, email_status);
      }
    });
  });
}
module.exports = {
  createEmailAndScheduleJob,
  scheduleSelectEmail,
  selectEmailWithOneHour,
  updateRedisDataToDatabase,
};

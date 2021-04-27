const nodemailer = require('nodemailer');
const smtpTransport = require('nodemailer-smtp-transport');
const logger = require('../logs/logger');

function sendEmail(emailData, handler) {
  // 开启一个 SMTP 连接池
  const transport = nodemailer.createTransport(smtpTransport({
    host: 'smtp.qq.com', // qq邮箱主机
    secure: true, // 使用 SSL
    secureConnection: true, // 使用 SSL
    port: 465, // SMTP 端口
    auth: {
      user: emailData.fromEmail, // 账号   你自定义的域名邮箱账号
      pass: emailData.password, // 密码   你自己开启SMPT获取的密码
    },
  }));
  // 设置邮件内容  可以拼接html 美化发送内容
  const mailOptions = {
    from: emailData.fromEmail, // 发件地址
    to: emailData.toEmail, // 收件列表
    subject: emailData.emailSubject, // 标题
    text: 'text',
    html: emailData.emailContent, // html 内容
  };
  transport.sendMail(mailOptions, (error) => {
    if (error) {
      handler(2);
      logger.info(`[id=${emailData.uuid}] 发送失败`);
    } else {
      handler(1);
      logger.info(`[id=${emailData.uuid}] 发送成功`);
    }
    transport.close(); // 如果没用，关闭连接池
  });
}

module.exports = { sendEmail };

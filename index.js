const exprss = require('express');
const bodyParser = require('body-parser');
const emialController = require('./controller/emailController');
const emailService = require('./service/emailService');

const app = exprss();
emailService.scheduleSelectEmail();
emailService.selectEmailWithOneHour();
emailService.updateRedisDataToDatabase();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin);
  res.header('Access-Control-Allow-Headers', 'content-type');
  res.header('Access-Control-Allow-Methods', 'PUT,POST,GET,DELETE,OPTIONS');
  res.header('Access-control-Allow-Credentials', 'true');
  next();
});
app.use('/email', emialController);
module.exports = app;

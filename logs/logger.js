const log4js = require('log4js');

log4js.configure({
  appenders: {
    console: { type: 'console' },
    filelog: { type: 'file', filename: 'logs/access.log' },
  },
  categories: {

    default: { appenders: ['console', 'filelog'], level: 'debug' },
    access: { appenders: ['filelog'], level: 'debug' },
  },
});
const logger = log4js.getLogger('access');

module.exports = logger;

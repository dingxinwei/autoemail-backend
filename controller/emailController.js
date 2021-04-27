const express = require('express');
const log4js = require('log4js');
const logger = require('../logs/logger');

const router = express.Router();
const emailService = require('../service/emailService');

router.use(log4js.connectLogger(logger, { level: 'debug', format: ':method :url' }));
router.post('', (req, res) => {
  emailService.createEmailAndScheduleJob(req, res);
});
module.exports = router;

const express = require('express');

const router = express.Router();
const emailService = require('../service/emailService');

router.post('', (req, res) => {
  emailService.createEmailAndScheduleJob(req, res);
});
module.exports = router;

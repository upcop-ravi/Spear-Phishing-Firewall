const express = require('express');
const { verifyAccommodation, submitPublicReport, reportSpamWebsite } = require('../controllers/mobileController');

const router = express.Router();

router.get('/verify', verifyAccommodation);
router.post('/report', submitPublicReport);
router.post('/spam', reportSpamWebsite);

module.exports = router;

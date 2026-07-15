const express = require('express');
const { getAnalytics, resetUserPassword } = require('../controllers/analyticsController');

const router = express.Router();

router.get('/', getAnalytics);
router.post('/reset-password', resetUserPassword);

module.exports = router;

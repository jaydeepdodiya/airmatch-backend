const express = require('express');
const usersController = require('../controllers/users.controller');
const { requireAuth } = require('../middleware/requireAuth');

const router = express.Router();

router.use(requireAuth);
router.get('/me', usersController.getMe);
router.put('/me', usersController.updateMe);
router.post('/fcm-token', usersController.saveFcmToken);

module.exports = router;

const express = require('express');
const usersController = require('../controllers/users.controller');
const { requireAuth } = require('../middleware/requireAuth');

const router = express.Router();

router.use(requireAuth);
router.get('/me', usersController.getMe);
router.put('/me', usersController.updateMe);

module.exports = router;

const express = require('express');
const healthRoutes = require('./health.routes');
const usersRoutes = require('./users.routes');
const tripsRoutes = require('./trips.routes');
const matchesRoutes = require('./matches.routes');
const chatRoutes = require('./chat.routes');
const { requireAuth } = require('../middleware/requireAuth');

const router = express.Router();

router.use('/health', healthRoutes);
router.use('/users', usersRoutes);
router.use('/trips', requireAuth, tripsRoutes);
router.use('/matches', requireAuth, matchesRoutes);
router.use('/chat', requireAuth, chatRoutes);

module.exports = router;

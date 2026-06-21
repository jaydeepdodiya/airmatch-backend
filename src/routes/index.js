const express = require('express');
const healthRoutes = require('./health.routes');
const usersRoutes = require('./users.routes');
const tripsRoutes = require('./trips.routes');
const { requireAuth } = require('../middleware/requireAuth');

const router = express.Router();

router.use('/health', healthRoutes);
router.use('/users', usersRoutes);
router.use('/trips', requireAuth, tripsRoutes);

module.exports = router;

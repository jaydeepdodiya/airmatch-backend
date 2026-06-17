const express = require('express');
const healthRoutes = require('./health.routes');

const router = express.Router();

// Mount feature routes under /api/*
router.use('/health', healthRoutes);

// Future routes (we will add these step by step):
// router.use('/users', require('./users.routes'));
// router.use('/trips', require('./trips.routes'));
// router.use('/matches', require('./matches.routes'));

module.exports = router;

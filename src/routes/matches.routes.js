const express = require('express');
const matchesController = require('../controllers/matches.controller');

const router = express.Router();

router.get('/', matchesController.listMatchRequests);
router.post('/request', matchesController.createMatchRequest);
router.get('/:id', matchesController.getMatchRequest);
router.put('/:id/respond', matchesController.respondToMatchRequest);

module.exports = router;

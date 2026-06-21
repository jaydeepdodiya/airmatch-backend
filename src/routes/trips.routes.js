const express = require('express');
const tripsController = require('../controllers/trips.controller');

const router = express.Router();

router.get('/', tripsController.listTrips);
router.post('/', tripsController.createTrip);
router.get('/:id/matches', tripsController.getTripMatches);
router.get('/:id', tripsController.getTrip);

module.exports = router;

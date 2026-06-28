const tripStore = require('../services/tripStore');
const { findMatches } = require('../services/matchService');

const REQUIRED_FIELDS = [
  'airportIata',
  'arrivalAt',
  'destinationLabel',
  'destinationLat',
  'destinationLng',
  'partySize',
];

function validateTripBody(body) {
  const missing = REQUIRED_FIELDS.filter((field) => body[field] == null);
  if (missing.length > 0) {
    const error = new Error(`Missing required fields: ${missing.join(', ')}`);
    error.status = 400;
    throw error;
  }

  if (body.partySize < 1 || body.partySize > 6) {
    const error = new Error('partySize must be between 1 and 6');
    error.status = 400;
    throw error;
  }
}

async function listTrips(req, res) {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 20));

  const result = await tripStore.listTripsForUser(req.user.uid, { page, limit });
  res.json(result);
}

async function getTrip(req, res) {
  const trip = await tripStore.getTripById(req.params.id);
  if (!trip) {
    return res.status(404).json({ error: 'Trip not found' });
  }
  return res.json({ trip });
}

async function createTrip(req, res, next) {
  try {
    validateTripBody(req.body);
    const trip = await tripStore.createTrip({
      ...req.body,
      userId: req.user.uid,
    });
    res.status(201).json({ trip });
  } catch (error) {
    next(error);
  }
}

async function getTripMatches(req, res) {
  const trip = await tripStore.getTripById(req.params.id);
  if (!trip) {
    return res.status(404).json({ error: 'Trip not found' });
  }

  const candidates = await tripStore.listTrips();
  const matches = findMatches(trip, candidates);
  return res.json({ tripId: trip.id, matches });
}

module.exports = {
  listTrips,
  getTrip,
  createTrip,
  getTripMatches,
};

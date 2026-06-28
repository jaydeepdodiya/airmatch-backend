const Trip = require('../models/Trip');
const { createId } = require('../utils/id');
const { serializeDoc } = require('../utils/serializeDoc');

async function listTrips() {
  const trips = await Trip.find({ status: 'SEARCHING' }).exec();
  return trips.map(serializeDoc);
}

async function listTripsForUser(userId, { page = 1, limit = 20 } = {}) {
  const safePage = Math.max(1, page);
  const safeLimit = Math.min(50, Math.max(1, limit));
  const skip = (safePage - 1) * safeLimit;

  const filter = { userId, status: 'SEARCHING' };

  const [trips, total] = await Promise.all([
    Trip.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(safeLimit)
      .exec(),
    Trip.countDocuments(filter).exec(),
  ]);

  return {
    trips: trips.map(serializeDoc),
    page: safePage,
    limit: safeLimit,
    total,
    hasMore: skip + trips.length < total,
  };
}

async function getTripById(id) {
  const trip = await Trip.findOne({ id }).exec();
  return serializeDoc(trip);
}

async function createTrip(payload) {
  const trip = await Trip.create({
    id: createId(),
    userId: payload.userId,
    airportIata: payload.airportIata.toUpperCase(),
    terminal: payload.terminal ?? null,
    arrivalAt: new Date(payload.arrivalAt),
    destinationLabel: payload.destinationLabel,
    destinationLat: payload.destinationLat,
    destinationLng: payload.destinationLng,
    partySize: payload.partySize,
    luggage: payload.luggage ?? 'carry_on',
    vehiclePref: payload.vehiclePref ?? 'economy',
    status: 'SEARCHING',
  });

  return serializeDoc(trip);
}

async function updateTripStatus(id, status) {
  const trip = await Trip.findOneAndUpdate(
    { id },
    { status },
    { returnDocument: 'after' },
  ).exec();

  return serializeDoc(trip);
}

module.exports = {
  listTrips,
  listTripsForUser,
  getTripById,
  createTrip,
  updateTripStatus,
};

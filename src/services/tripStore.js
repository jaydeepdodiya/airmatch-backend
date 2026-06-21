/**
 * In-memory trip storage for Phase 0.
 * Data resets when the server restarts — we'll replace this with a database later.
 */
const { createId } = require('../utils/id');

const trips = new Map();

function listTrips() {
  return Array.from(trips.values()).filter((t) => t.status === 'SEARCHING');
}

function getTripById(id) {
  return trips.get(id) ?? null;
}

function createTrip(payload) {
  const trip = {
    id: createId(),
    userId: payload.userId,
    airportIata: payload.airportIata.toUpperCase(),
    terminal: payload.terminal ?? null,
    arrivalAt: payload.arrivalAt,
    destinationLabel: payload.destinationLabel,
    destinationLat: payload.destinationLat,
    destinationLng: payload.destinationLng,
    partySize: payload.partySize,
    luggage: payload.luggage ?? 'carry_on',
    vehiclePref: payload.vehiclePref ?? 'economy',
    status: 'SEARCHING',
    createdAt: new Date().toISOString(),
  };

  trips.set(trip.id, trip);
  return trip;
}

module.exports = {
  listTrips,
  getTripById,
  createTrip,
};

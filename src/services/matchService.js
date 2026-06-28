const MATCH_THRESHOLD = 0.65;
const TIME_BUFFER_MS = 45 * 60 * 1000; // 45 minutes

const VEHICLE_TIERS = { economy: 0, xl: 1, premium: 2 };

function haversineKm(lat1, lng1, lat2, lng2) {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function timeOverlap(source, candidate) {
  const sourceTime = new Date(source.arrivalAt).getTime();
  const candidateTime = new Date(candidate.arrivalAt).getTime();
  const diff = Math.abs(sourceTime - candidateTime);
  if (diff > TIME_BUFFER_MS) return 0;
  return 1 - diff / TIME_BUFFER_MS;
}

function destinationProximity(source, candidate) {
  const km = haversineKm(
    source.destinationLat,
    source.destinationLng,
    candidate.destinationLat,
    candidate.destinationLng,
  );
  if (km <= 2) return 1;
  if (km >= 30) return 0;
  return 1 - (km - 2) / 28;
}

function partySizeFit(source, candidate) {
  const total = source.partySize + candidate.partySize;
  const capacity = source.vehiclePref === 'xl' ? 6 : 4;
  return total <= capacity ? 1 : Math.max(0, 1 - (total - capacity) / capacity);
}

function vehiclePreferenceAlign(source, candidate) {
  const a = VEHICLE_TIERS[source.vehiclePref] ?? 0;
  const b = VEHICLE_TIERS[candidate.vehiclePref] ?? 0;
  const diff = Math.abs(a - b);
  if (diff === 0) return 1;
  if (diff === 1) return 0.7;
  return 0.3;
}

function trustScore() {
  // Phase 0: fixed demo score until we have user profiles
  return 0.5;
}

function scoreTripPair(source, candidate) {
  const breakdown = {
    timeOverlap: timeOverlap(source, candidate),
    destinationProximity: destinationProximity(source, candidate),
    partySizeFit: partySizeFit(source, candidate),
    vehiclePreferenceAlign: vehiclePreferenceAlign(source, candidate),
    trustScore: trustScore(),
  };

  const score =
    0.35 * breakdown.timeOverlap +
    0.3 * breakdown.destinationProximity +
    0.15 * breakdown.partySizeFit +
    0.1 * breakdown.vehiclePreferenceAlign +
    0.1 * breakdown.trustScore;

  return { score: Math.round(score * 100) / 100, breakdown };
}

function findMatches(sourceTrip, allTrips) {
  return allTrips
    .filter(
      (trip) =>
        trip.id !== sourceTrip.id &&
        trip.airportIata === sourceTrip.airportIata &&
        trip.status === 'SEARCHING',
    )
    .map((trip) => {
      const { score, breakdown } = scoreTripPair(sourceTrip, trip);
      return { trip, score, breakdown };
    })
    .filter((match) => match.score >= MATCH_THRESHOLD)
    .sort((a, b) => b.score - a.score);
}

module.exports = { findMatches, scoreTripPair, MATCH_THRESHOLD };

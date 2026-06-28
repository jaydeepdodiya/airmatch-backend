const MatchRequest = require('../models/MatchRequest');
const { createId } = require('../utils/id');
const { serializeDoc } = require('../utils/serializeDoc');

const REQUEST_TTL_MS = 24 * 60 * 60 * 1000;

async function createMatchRequest(payload) {
  const now = new Date();
  const request = await MatchRequest.create({
    id: createId(),
    fromTripId: payload.fromTripId,
    toTripId: payload.toTripId,
    fromUserId: payload.fromUserId,
    toUserId: payload.toUserId,
    status: 'pending',
    score: payload.score ?? 0,
    expiresAt: new Date(now.getTime() + REQUEST_TTL_MS),
  });

  return serializeDoc(request);
}

async function getMatchRequestById(id) {
  const request = await MatchRequest.findOne({ id }).exec();
  return serializeDoc(request);
}

async function findPendingRequest(fromTripId, toTripId) {
  const request = await MatchRequest.findOne({
    status: 'pending',
    fromTripId,
    toTripId,
  }).exec();

  return serializeDoc(request);
}

async function listMatchRequestsForUser(userId, status) {
  const filter = {
    $or: [{ fromUserId: userId }, { toUserId: userId }],
  };

  if (status && status !== 'all') {
    filter.status = status;
  }

  const requests = await MatchRequest.find(filter)
    .sort({ createdAt: -1 })
    .exec();

  return requests.map(serializeDoc);
}

async function respondToMatchRequest(id, userId, action) {
  const request = await MatchRequest.findOne({ id }).exec();
  if (!request) return { error: 'not_found' };
  if (request.toUserId !== userId) return { error: 'forbidden' };
  if (request.status !== 'pending') return { error: 'not_pending' };

  request.status = action === 'accept' ? 'accepted' : 'declined';
  await request.save();

  return { request: serializeDoc(request) };
}

module.exports = {
  createMatchRequest,
  getMatchRequestById,
  findPendingRequest,
  listMatchRequestsForUser,
  respondToMatchRequest,
};

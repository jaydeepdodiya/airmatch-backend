const MatchSession = require('../models/MatchSession');
const { createId } = require('../utils/id');
const { serializeDoc } = require('../utils/serializeDoc');

async function createMatchSession(payload) {
  const session = await MatchSession.create({
    id: payload.id ?? createId(),
    matchRequestId: payload.matchRequestId,
    fromTripId: payload.fromTripId,
    toTripId: payload.toTripId,
    participantIds: payload.participantIds,
    status: 'active',
  });

  return serializeDoc(session);
}

async function getSessionById(id) {
  const session = await MatchSession.findOne({ id }).exec();
  return serializeDoc(session);
}

async function getSessionByMatchRequestId(matchRequestId) {
  const session = await MatchSession.findOne({ matchRequestId }).exec();
  return serializeDoc(session);
}

async function listSessionsForUser(userId) {
  const sessions = await MatchSession.find({ participantIds: userId })
    .sort({ updatedAt: -1 })
    .exec();

  return sessions.map(serializeDoc);
}

async function userCanAccessSession(sessionId, userId) {
  const session = await MatchSession.findOne({ id: sessionId }).exec();
  if (!session) return false;
  return session.participantIds.includes(userId);
}

module.exports = {
  createMatchSession,
  getSessionById,
  getSessionByMatchRequestId,
  listSessionsForUser,
  userCanAccessSession,
};

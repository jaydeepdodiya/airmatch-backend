const tripStore = require('../services/tripStore');
const matchRequestStore = require('../services/matchRequestStore');
const matchSessionStore = require('../services/matchSessionStore');
const { syncChatSessionToFirestore } = require('../services/chatSessionSync');
const { findMatches, scoreTripPair } = require('../services/matchService');
const { getUserByUid } = require('../services/userStore');
const {
  notifyMatchRequestReceived,
  notifyMatchAccepted,
  notifyMatchDeclined,
} = require('../services/notificationService');

async function enrichMatchRequest(request) {
  const [session, fromTrip, toTrip] = await Promise.all([
    matchSessionStore.getSessionByMatchRequestId(request.id),
    tripStore.getTripById(request.fromTripId),
    tripStore.getTripById(request.toTripId),
  ]);

  return {
    ...request,
    sessionId: session?.id ?? null,
    fromTrip,
    toTrip,
  };
}

async function listMatchRequests(req, res) {
  const status = req.query.status ?? 'all';
  const allowed = ['all', 'pending', 'accepted', 'declined'];
  if (!allowed.includes(status)) {
    return res.status(400).json({ error: 'Invalid status filter' });
  }

  const requests = await matchRequestStore.listMatchRequestsForUser(
    req.user.uid,
    status === 'all' ? null : status,
  );
  const matchRequests = await Promise.all(requests.map(enrichMatchRequest));

  return res.json({ matchRequests });
}

async function getMatchRequest(req, res) {
  const request = await matchRequestStore.getMatchRequestById(req.params.id);
  if (!request) {
    return res.status(404).json({ error: 'Match request not found' });
  }

  const isParticipant =
    request.fromUserId === req.user.uid || request.toUserId === req.user.uid;
  if (!isParticipant) {
    return res.status(403).json({ error: 'Not allowed to view this request' });
  }

  return res.json({ matchRequest: await enrichMatchRequest(request) });
}

async function createMatchRequest(req, res) {
  const { fromTripId, toTripId, score } = req.body ?? {};

  if (!fromTripId || !toTripId) {
    return res.status(400).json({ error: 'fromTripId and toTripId are required' });
  }

  const fromTrip = await tripStore.getTripById(fromTripId);
  if (!fromTrip) {
    return res.status(404).json({ error: 'Source trip not found' });
  }
  if (fromTrip.userId !== req.user.uid) {
    return res.status(403).json({ error: 'You can only request from your own trip' });
  }

  const toTrip = await tripStore.getTripById(toTripId);
  if (!toTrip) {
    return res.status(404).json({ error: 'Target trip not found' });
  }
  if (toTrip.userId === req.user.uid) {
    return res.status(400).json({ error: 'Cannot match with your own trip' });
  }

  const existing = await matchRequestStore.findPendingRequest(fromTripId, toTripId);
  if (existing) {
    return res.status(409).json({ error: 'Match request already pending' });
  }

  let resolvedScore = score;
  if (resolvedScore == null) {
    resolvedScore = scoreTripPair(fromTrip, toTrip).score;
  }

  const matchRequest = await matchRequestStore.createMatchRequest({
    fromTripId,
    toTripId,
    fromUserId: req.user.uid,
    toUserId: toTrip.userId,
    score: resolvedScore,
  });

  const sender = await getUserByUid(req.user.uid);
  await notifyMatchRequestReceived({
    toUserId: toTrip.userId,
    matchRequestId: matchRequest.id,
    fromLabel: sender?.displayName ?? 'A traveler',
  });

  return res.status(201).json({
    matchRequest: await enrichMatchRequest(matchRequest),
  });
}

async function respondToMatchRequest(req, res) {
  const action = req.body?.action;
  if (action !== 'accept' && action !== 'decline') {
    return res.status(400).json({ error: 'action must be accept or decline' });
  }

  const result = await matchRequestStore.respondToMatchRequest(
    req.params.id,
    req.user.uid,
    action,
  );

  if (result.error === 'not_found') {
    return res.status(404).json({ error: 'Match request not found' });
  }
  if (result.error === 'forbidden') {
    return res.status(403).json({ error: 'Only the recipient can respond' });
  }
  if (result.error === 'not_pending') {
    return res.status(409).json({ error: 'Match request is no longer pending' });
  }

  let session = null;
  if (action === 'accept') {
    await tripStore.updateTripStatus(result.request.fromTripId, 'MATCHED');
    await tripStore.updateTripStatus(result.request.toTripId, 'MATCHED');

    session = await matchSessionStore.createMatchSession({
      id: result.request.id,
      matchRequestId: result.request.id,
      fromTripId: result.request.fromTripId,
      toTripId: result.request.toTripId,
      participantIds: [result.request.fromUserId, result.request.toUserId],
    });
    await syncChatSessionToFirestore(session);

    await notifyMatchAccepted({
      toUserId: result.request.fromUserId,
      matchRequestId: result.request.id,
      sessionId: session.id,
    });
  } else {
    await notifyMatchDeclined({
      toUserId: result.request.fromUserId,
      matchRequestId: result.request.id,
    });
  }

  return res.json({
    matchRequest: await enrichMatchRequest(result.request),
    session,
  });
}

module.exports = {
  listMatchRequests,
  getMatchRequest,
  createMatchRequest,
  respondToMatchRequest,
};

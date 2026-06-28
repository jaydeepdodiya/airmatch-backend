const tripStore = require('../services/tripStore');
const matchSessionStore = require('../services/matchSessionStore');
const { syncChatSessionToFirestore } = require('../services/chatSessionSync');
const { notifyChatMessage } = require('../services/notificationService');

async function enrichSession(session) {
  const [fromTrip, toTrip] = await Promise.all([
    tripStore.getTripById(session.fromTripId),
    tripStore.getTripById(session.toTripId),
  ]);

  return {
    ...session,
    fromTrip,
    toTrip,
  };
}

async function listChatSessions(req, res) {
  const rawSessions = await matchSessionStore.listSessionsForUser(req.user.uid);
  const sessions = await Promise.all(rawSessions.map(enrichSession));
  return res.json({ sessions });
}

async function getChatSession(req, res) {
  const session = await matchSessionStore.getSessionById(req.params.id);
  if (!session) {
    return res.status(404).json({ error: 'Chat session not found' });
  }
  if (!(await matchSessionStore.userCanAccessSession(session.id, req.user.uid))) {
    return res.status(403).json({ error: 'Not allowed to access this chat' });
  }
  return res.json({ session: await enrichSession(session) });
}

async function getChatSessionByMatchRequest(req, res) {
  const session = await matchSessionStore.getSessionByMatchRequestId(
    req.params.matchRequestId,
  );
  if (!session) {
    return res.status(404).json({ error: 'Chat session not found' });
  }
  if (!(await matchSessionStore.userCanAccessSession(session.id, req.user.uid))) {
    return res.status(403).json({ error: 'Not allowed to access this chat' });
  }
  return res.json({ session: await enrichSession(session) });
}

async function ensureChatSessionFirestore(req, res) {
  const session = await matchSessionStore.getSessionById(req.params.id);
  if (!session) {
    return res.status(404).json({ error: 'Chat session not found' });
  }
  if (!(await matchSessionStore.userCanAccessSession(session.id, req.user.uid))) {
    return res.status(403).json({ error: 'Not allowed to access this chat' });
  }

  const synced = await syncChatSessionToFirestore(session);
  return res.json({
    session: await enrichSession(session),
    firestoreSynced: synced,
  });
}

async function notifyNewMessage(req, res) {
  const session = await matchSessionStore.getSessionById(req.params.id);
  if (!session) {
    return res.status(404).json({ error: 'Chat session not found' });
  }
  if (!(await matchSessionStore.userCanAccessSession(session.id, req.user.uid))) {
    return res.status(403).json({ error: 'Not allowed to access this chat' });
  }

  const recipientId = session.participantIds.find(
    (participantId) => participantId !== req.user.uid,
  );
  if (!recipientId) {
    return res.status(400).json({ error: 'No recipient for this session' });
  }

  const preview = req.body?.preview ?? 'New message';
  await notifyChatMessage({
    toUserId: recipientId,
    sessionId: session.id,
    matchRequestId: session.matchRequestId,
    preview: String(preview).slice(0, 120),
  });

  return res.json({ ok: true });
}

module.exports = {
  listChatSessions,
  getChatSession,
  getChatSessionByMatchRequest,
  ensureChatSessionFirestore,
  notifyNewMessage,
};

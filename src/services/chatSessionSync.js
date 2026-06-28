const { getFirestore } = require('../config/firebase');

async function syncChatSessionToFirestore(session) {
  const db = getFirestore();
  if (!db) return false;

  await db.collection('chatSessions').doc(session.id).set(
    {
      matchRequestId: session.matchRequestId,
      fromTripId: session.fromTripId,
      toTripId: session.toTripId,
      participantIds: session.participantIds,
      status: session.status,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
    },
    { merge: true },
  );

  return true;
}

module.exports = { syncChatSessionToFirestore };

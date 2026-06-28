const { getMessaging } = require('../config/firebase');
const { getUserByUid } = require('../services/userStore');

function toStringData(data) {
  return Object.fromEntries(
    Object.entries(data).map(([key, value]) => [key, String(value ?? '')]),
  );
}

async function sendPushToUser(userId, notification, data = {}) {
  const messaging = getMessaging();
  if (!messaging) {
    return { sent: 0, skipped: 'messaging_unavailable' };
  }

  const user = await getUserByUid(userId);
  const tokens = user?.fcmTokens ?? [];
  if (tokens.length === 0) {
    return { sent: 0, skipped: 'no_tokens' };
  }

  const response = await messaging.sendEachForMulticast({
    tokens,
    notification,
    data: toStringData(data),
  });

  return {
    sent: response.successCount,
    failed: response.failureCount,
  };
}

async function notifyMatchRequestReceived({ toUserId, matchRequestId, fromLabel }) {
  return sendPushToUser(
    toUserId,
    {
      title: 'New match request',
      body: `${fromLabel} wants to share a ride with you`,
    },
    {
      type: 'match_request',
      matchRequestId,
    },
  );
}

async function notifyMatchAccepted({ toUserId, matchRequestId, sessionId }) {
  return sendPushToUser(
    toUserId,
    {
      title: 'Match accepted',
      body: 'Your match request was accepted — open chat to coordinate',
    },
    {
      type: 'match_accepted',
      matchRequestId,
      sessionId,
    },
  );
}

async function notifyMatchDeclined({ toUserId, matchRequestId }) {
  return sendPushToUser(
    toUserId,
    {
      title: 'Match declined',
      body: 'Your match request was declined',
    },
    {
      type: 'match_declined',
      matchRequestId,
    },
  );
}

async function notifyChatMessage({
  toUserId,
  sessionId,
  matchRequestId,
  preview,
}) {
  return sendPushToUser(
    toUserId,
    {
      title: 'New message',
      body: preview,
    },
    {
      type: 'chat_message',
      sessionId,
      matchRequestId,
    },
  );
}

module.exports = {
  sendPushToUser,
  notifyMatchRequestReceived,
  notifyMatchAccepted,
  notifyMatchDeclined,
  notifyChatMessage,
};

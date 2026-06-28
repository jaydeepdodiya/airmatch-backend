const { getUserByUid, upsertUser } = require('./userStore');

async function addFcmToken(uid, token) {
  if (!token || typeof token !== 'string') {
    return null;
  }

  const existing = await getUserByUid(uid);
  const tokens = new Set([...(existing?.fcmTokens ?? []), token]);
  return upsertUser(uid, { fcmTokens: [...tokens] });
}

async function removeFcmToken(uid, token) {
  const existing = await getUserByUid(uid);
  if (!existing) return null;

  const tokens = (existing.fcmTokens ?? []).filter((value) => value !== token);
  return upsertUser(uid, { fcmTokens: tokens });
}

module.exports = { addFcmToken, removeFcmToken };

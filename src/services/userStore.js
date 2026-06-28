const User = require('../models/User');
const { serializeDoc } = require('../utils/serializeDoc');

async function getUserByUid(uid) {
  const user = await User.findOne({ uid }).exec();
  return serializeDoc(user);
}

async function upsertUser(uid, payload) {
  const existing = await User.findOne({ uid }).exec();

  const update = {
    uid,
    displayName: payload.displayName ?? existing?.displayName ?? 'Traveler',
    email: payload.email ?? existing?.email ?? '',
    photoUrl: payload.photoUrl ?? existing?.photoUrl ?? null,
    emailVerified: payload.emailVerified ?? existing?.emailVerified ?? false,
    languages: payload.languages ?? existing?.languages ?? [],
    onboardingCompleted:
      payload.onboardingCompleted ?? existing?.onboardingCompleted ?? false,
    fcmTokens: payload.fcmTokens ?? existing?.fcmTokens ?? [],
    trustScore: existing?.trustScore ?? 0.5,
  };

  const user = await User.findOneAndUpdate({ uid }, update, {
    upsert: true,
    returnDocument: 'after',
    setDefaultsOnInsert: true,
  }).exec();

  return serializeDoc(user);
}

module.exports = { getUserByUid, upsertUser };

const { createId } = require('../utils/id');

const users = new Map();

function getUserByUid(uid) {
  return users.get(uid) ?? null;
}

function upsertUser(uid, payload) {
  const existing = users.get(uid);
  const user = {
    uid,
    displayName: payload.displayName ?? existing?.displayName ?? 'Traveler',
    email: payload.email ?? existing?.email ?? '',
    photoUrl: payload.photoUrl ?? existing?.photoUrl ?? null,
    emailVerified: payload.emailVerified ?? existing?.emailVerified ?? false,
    trustScore: existing?.trustScore ?? 0.5,
    createdAt: existing?.createdAt ?? new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  users.set(uid, user);
  return user;
}

module.exports = { getUserByUid, upsertUser };

const { getUserByUid, upsertUser } = require('../services/userStore');
const { addFcmToken } = require('../services/fcmTokenStore');

async function getMe(req, res) {
  const user = await getUserByUid(req.user.uid);
  if (!user) {
    return res.status(404).json({ error: 'User profile not found' });
  }
  return res.json({ user });
}

async function updateMe(req, res) {
  const user = await upsertUser(req.user.uid, {
    displayName: req.body.displayName,
    email: req.body.email,
    photoUrl: req.body.photoUrl,
    emailVerified: req.body.emailVerified,
    languages: req.body.languages,
    onboardingCompleted: req.body.onboardingCompleted,
  });
  return res.json({ user });
}

async function saveFcmToken(req, res) {
  const token = req.body?.token;
  if (!token || typeof token !== 'string') {
    return res.status(400).json({ error: 'token is required' });
  }

  const user = await addFcmToken(req.user.uid, token.trim());
  return res.json({ user: { uid: user.uid, fcmTokens: user.fcmTokens } });
}

module.exports = { getMe, updateMe, saveFcmToken };

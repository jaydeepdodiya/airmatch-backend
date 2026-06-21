const { getUserByUid, upsertUser } = require('../services/userStore');

function getMe(req, res) {
  const user = getUserByUid(req.user.uid);
  if (!user) {
    return res.status(404).json({ error: 'User profile not found' });
  }
  return res.json({ user });
}

function updateMe(req, res) {
  const user = upsertUser(req.user.uid, {
    displayName: req.body.displayName,
    email: req.body.email,
    photoUrl: req.body.photoUrl,
    emailVerified: req.body.emailVerified,
  });
  return res.json({ user });
}

module.exports = { getMe, updateMe };

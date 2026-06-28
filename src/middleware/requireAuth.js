const env = require('../config/env');
const { getAuth } = require('../config/firebase');
const { upsertUser } = require('../services/userStore');

async function requireAuth(req, res, next) {
  if (env.skipAuth) {
    req.user = {
      uid: 'demo-user',
      email: 'demo@airmatch.dev',
      name: 'Demo Traveler',
    };
    await upsertUser('demo-user', {
      displayName: 'Demo Traveler',
      email: 'demo@airmatch.dev',
      onboardingCompleted: true,
      languages: ['English'],
    });
    return next();
  }

  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing Authorization Bearer token' });
  }

  const auth = getAuth();
  if (!auth) {
    return res.status(503).json({
      error: 'Auth service unavailable. Set GOOGLE_APPLICATION_CREDENTIALS or SKIP_AUTH=true',
    });
  }

  try {
    const token = header.slice('Bearer '.length);
    const decoded = await auth.verifyIdToken(token);
    req.user = decoded;
    await upsertUser(decoded.uid, {
      displayName: decoded.name,
      email: decoded.email,
      photoUrl: decoded.picture,
      emailVerified: decoded.email_verified,
    });
    return next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

module.exports = { requireAuth };

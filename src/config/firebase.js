const admin = require('firebase-admin');
const env = require('../config/env');
const fs = require('fs');

let initialized = false;

function initFirebaseAdmin() {
  if (initialized) return admin.apps.length > 0;

  if (env.skipAuth) {
    return false;
  }

  const credPath = env.googleApplicationCredentials;
  if (!credPath || !fs.existsSync(credPath)) {
    console.warn(
      'Firebase Admin not configured. Set GOOGLE_APPLICATION_CREDENTIALS or SKIP_AUTH=true',
    );
    return false;
  }

  admin.initializeApp({
    credential: admin.credential.cert(require(credPath)),
  });
  initialized = true;
  return true;
}

function getAuth() {
  return admin.apps.length > 0 ? admin.auth() : null;
}

module.exports = { initFirebaseAdmin, getAuth };

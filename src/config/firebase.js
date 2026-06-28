const admin = require('firebase-admin');
const env = require('./env');
const fs = require('fs');

let initialized = false;

function loadServiceAccount() {
  if (env.firebaseServiceAccountJson) {
    try {
      return JSON.parse(env.firebaseServiceAccountJson);
    } catch (error) {
      console.error('Invalid FIREBASE_SERVICE_ACCOUNT_JSON:', error.message);
      return null;
    }
  }

  const credPath = env.googleApplicationCredentials;
  if (credPath && fs.existsSync(credPath)) {
    return require(credPath);
  }

  return null;
}

function initFirebaseAdmin() {
  if (initialized) return admin.apps.length > 0;

  if (env.skipAuth) {
    return false;
  }

  const serviceAccount = loadServiceAccount();
  if (!serviceAccount) {
    console.warn(
      'Firebase Admin not configured. Set FIREBASE_SERVICE_ACCOUNT_JSON, GOOGLE_APPLICATION_CREDENTIALS, or SKIP_AUTH=true',
    );
    return false;
  }

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
  initialized = true;
  return true;
}

function getAuth() {
  return admin.apps.length > 0 ? admin.auth() : null;
}

function getMessaging() {
  return admin.apps.length > 0 ? admin.messaging() : null;
}

function getFirestore() {
  return admin.apps.length > 0 ? admin.firestore() : null;
}

module.exports = { initFirebaseAdmin, getAuth, getFirestore, getMessaging };

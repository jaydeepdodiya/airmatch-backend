require('dotenv').config();

function parseCorsOrigins(raw) {
  if (!raw || !raw.trim()) return [];
  return raw
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}

const nodeEnv = process.env.NODE_ENV || 'development';

const env = {
  port: Number(process.env.PORT) || 3000,
  nodeEnv,
  isProduction: nodeEnv === 'production',
  skipAuth: process.env.SKIP_AUTH === 'true',
  googleApplicationCredentials: process.env.GOOGLE_APPLICATION_CREDENTIALS || '',
  firebaseServiceAccountJson: process.env.FIREBASE_SERVICE_ACCOUNT_JSON || '',
  mongodbUri:
    process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/airmatch',
  corsOrigins: parseCorsOrigins(process.env.CORS_ORIGINS),
};

module.exports = env;

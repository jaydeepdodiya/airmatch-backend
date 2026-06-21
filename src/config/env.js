require('dotenv').config();

const env = {
  port: Number(process.env.PORT) || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  skipAuth: process.env.SKIP_AUTH === 'true',
  googleApplicationCredentials: process.env.GOOGLE_APPLICATION_CREDENTIALS || '',
};

module.exports = env;

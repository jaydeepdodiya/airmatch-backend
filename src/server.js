const app = require('./app');
const env = require('./config/env');
const { connectDatabase } = require('./config/database');
const { initFirebaseAdmin } = require('./config/firebase');

async function start() {
  if (env.isProduction && env.skipAuth) {
    console.warn(
      'WARNING: SKIP_AUTH=true in production — disable before public launch',
    );
  }

  initFirebaseAdmin();
  await connectDatabase();

  app.listen(env.port, '0.0.0.0', () => {
    console.log(`AirMatch API running on port ${env.port} (${env.nodeEnv})`);
    console.log(`Health check: /api/health`);
    if (env.skipAuth) {
      console.log('SKIP_AUTH=true — using demo-user for local development');
    }
  });
}

start().catch((error) => {
  console.error('Failed to start server:', error.message);
  process.exit(1);
});

const app = require('./app');
const env = require('./config/env');
const { initFirebaseAdmin } = require('./config/firebase');

initFirebaseAdmin();

app.listen(env.port, () => {
  console.log(`AirMatch API running on http://localhost:${env.port}`);
  console.log(`Health check: http://localhost:${env.port}/api/health`);
  if (env.skipAuth) {
    console.log('SKIP_AUTH=true — using demo-user for local development');
  }
});

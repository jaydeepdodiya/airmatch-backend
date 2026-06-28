/**
 * Controllers hold request/response logic.
 * Keep them thin — validate input, call a service, return JSON.
 */
function getHealth(req, res) {
  res.json({
    status: 'ok',
    service: 'airmatch-api',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
  });
}

module.exports = { getHealth };

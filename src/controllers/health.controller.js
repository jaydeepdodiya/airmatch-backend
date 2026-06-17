/**
 * Controllers hold request/response logic.
 * Keep them thin — validate input, call a service, return JSON.
 */
function getHealth(req, res) {
  res.json({
    status: 'ok',
    service: 'airmatch-api',
    timestamp: new Date().toISOString(),
  });
}

module.exports = { getHealth };

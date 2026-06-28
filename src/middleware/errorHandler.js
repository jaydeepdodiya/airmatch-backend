/**
 * Central error handler — consistent JSON shape for all API errors.
 */
function errorHandler(err, req, res, next) {
  console.error(err);

  const status = err.status || err.statusCode || 500;
  const code =
    err.code ||
    (status === 429
      ? 'RATE_LIMITED'
      : status >= 500
        ? 'INTERNAL_ERROR'
        : 'REQUEST_ERROR');

  res.status(status).json({
    error: err.message || 'Internal Server Error',
    code,
  });
}

module.exports = errorHandler;

/**
 * Central error handler — catches thrown errors from any route.
 */
function errorHandler(err, req, res, next) {
  console.error(err);

  const status = err.status || 500;
  res.status(status).json({
    error: err.message || 'Internal Server Error',
  });
}

module.exports = errorHandler;

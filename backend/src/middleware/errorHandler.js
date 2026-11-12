const errorHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  const requestedStatus = Number(err.status || err.statusCode);
  const status = Number.isInteger(requestedStatus) && requestedStatus >= 400 && requestedStatus < 600
    ? requestedStatus
    : 500;

  console.error(`Error ${status} en ${req.method} ${req.originalUrl}:`, err);

  res.status(status).json({
    error: status < 500 ? err.message : 'Error interno del servidor'
  });
};

module.exports = errorHandler;

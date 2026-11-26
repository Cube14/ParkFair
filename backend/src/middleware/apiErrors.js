class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

function handleError(error, req, res, next) {
  if (res.headersSent) return next(error);

  let status = 500;
  let message = "Internal server error.";
  if (error instanceof ApiError) {
    ({ status, message } = error);
  } else if (error.code === 11000) {
    status = 409;
    message = "A matching record already exists.";
  } else if (["ValidationError", "CastError", "StrictModeError"].includes(error.name) ||
             error.type === "entity.parse.failed") {
    status = 400;
    message = "Invalid request data.";
  } else if (error.type === "entity.too.large") {
    status = 413;
    message = "Request body is too large.";
  } else {
    console.error(JSON.stringify({
      event: "api_error", method: req.method, category: error.constructor.name,
    }));
  }
  res.status(status).json({ success: false, message });
}

module.exports = { ApiError, handleError };

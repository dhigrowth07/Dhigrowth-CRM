/**
 * Centralized Express 5 Error Handling Middleware
 * Intercepts unhandled errors and formats them into uniform, developer-friendly JSON responses.
 */

export class AppError extends Error {
  constructor(message, statusCode = 500, details = null) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * 404 Not Found Middleware for unmatched routes
 */
export function notFoundHandler(req, res, next) {
  // Pass through static frontend paths and SPA entry
  if (!req.path.startsWith('/api') && !req.path.startsWith('/webhook')) {
    return next();
  }
  res.status(404).json({
    success: false,
    statusCode: 404,
    error: `Route not found: ${req.method} ${req.originalUrl}`,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Central Express Error Handler (Must have 4 parameters)
 */
export function errorHandler(err, req, res, next) {
  // If response has already started streaming, delegate to default Express handler
  if (res.headersSent) {
    return next(err);
  }

  let statusCode = err.statusCode || err.status || 500;
  let message = err.message || 'Internal Server Error';
  let details = err.details || null;

  // Handle Multer upload errors
  if (err.name === 'MulterError') {
    statusCode = 400;
    if (err.code === 'LIMIT_FILE_SIZE') {
      message = 'File upload failed: File size exceeds the 25MB limit.';
    } else if (err.code === 'LIMIT_FILE_COUNT') {
      message = 'File upload failed: Too many files uploaded at once.';
    } else {
      message = `File upload error: ${err.message}`;
    }
  }

  // Handle bad JSON body parsing errors
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    statusCode = 400;
    message = 'Malformed JSON payload in request body';
  }

  // Handle Meta Graph API errors
  if (err.response?.data?.error) {
    const metaErr = err.response.data.error;
    statusCode = 400;
    message = `Meta API Error: ${metaErr.message} (Code: ${metaErr.code})`;
    details = metaErr;
  }

  // Log error (suppress stack traces in production)
  const isDev = process.env.NODE_ENV !== 'production';
  console.error(`🚨 [ErrorHandler] ${req.method} ${req.originalUrl} - ${statusCode} ${message}`);
  if (isDev && statusCode === 500) {
    console.error(err.stack);
  }

  res.status(statusCode).json({
    success: false,
    statusCode,
    error: message,
    details,
    timestamp: new Date().toISOString(),
    ...(isDev && statusCode === 500 ? { stack: err.stack } : {}),
  });
}

export default {
  AppError,
  notFoundHandler,
  errorHandler,
};

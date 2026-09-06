/**
 * Centralized error handler ensuring internal stack traces, DB keys, or GCP infrastructure details
 * are never leaked to the client.
 */
export function errorHandler(err, req, res, next) {
  // Log full error details server-side for operational diagnosis
  console.error(`[Error] ${req.method} ${req.url} - ${err.message}`, {
    stack: err.stack,
    user: req.user?.uid || 'unauthenticated'
  });

  const statusCode = err.status || err.statusCode || 500;
  
  const response = {
    error: err.name || 'Internal Server Error',
    message: err.userMessage || err.message || 'An unexpected error occurred.',
    code: err.code || 'SERVER_ERROR'
  };

  // Only expose stack in local explicit dev mode if specifically needed
  if (process.env.NODE_ENV === 'development' && err.exposeStack) {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
}

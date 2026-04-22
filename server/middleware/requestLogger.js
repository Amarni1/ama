export function requestLogger(request, _response, next) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${request.method} ${request.originalUrl}`);
  next();
}

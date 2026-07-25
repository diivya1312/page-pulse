import { NextFunction, Request, Response } from 'express';
import { AppError, ApiErrorPayload, ErrorCode } from '../types';

/**
 * Catches requests to routes that don't exist and forwards a clean 404
 * instead of letting Express fall through to its default HTML page.
 */
export function notFoundHandler(req: Request, _res: Response, next: NextFunction): void {
  next(new AppError('NOT_FOUND', `Route ${req.method} ${req.originalUrl} does not exist.`, 404));
}

/**
 * Single, final error handler for the whole app. Every thrown/forwarded
 * error — validation, network, DNS, timeout, or an unexpected exception —
 * lands here and is converted into a consistent JSON envelope. This is
 * what guarantees the process never crashes on a bad request.
 */
export function globalErrorHandler(
  err: unknown,
  req: Request,
  res: Response<ApiErrorPayload>,
  _next: NextFunction
): void {
  if (err instanceof AppError) {
    if (err.statusCode >= 500) {
      // eslint-disable-next-line no-console
      console.error(`[${req.method} ${req.originalUrl}]`, err);
    }
    res.status(err.statusCode).json({
      error: { code: err.code, message: err.message },
    });
    return;
  }

  // Unknown/unexpected error — never leak internals to the client.
  // eslint-disable-next-line no-console
  console.error(`[${req.method} ${req.originalUrl}] Unhandled error:`, err);
  const code: ErrorCode = 'INTERNAL_ERROR';
  res.status(500).json({
    error: { code, message: 'Something went wrong while processing your request.' },
  });
}

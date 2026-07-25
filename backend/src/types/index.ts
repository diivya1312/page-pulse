/**
 * Shared type definitions for the Page Pulse API.
 * Keeping these in one place gives every layer (controller, service, tests)
 * a single source of truth for the shape of data moving through the app.
 */

/** Successful audit payload returned by POST /api/analyze */
export interface AnalyzeResult {
  url: string;
  status: number;
  responseTime: string; // e.g. "430ms" — formatted for direct display
  title: string;
  metaDescription: string;
  h1Count: number;
  missingAltImages: number;
  totalImages: number;
  wordCount: number;
  seoScore: number; // 0-100, derived score (bonus feature)
  performanceScore: number; // 0-100, derived score (bonus feature)
  redirected: boolean;
  finalUrl: string;
  contentType: string;
  fetchedAt: string; // ISO timestamp
}

/** Raw data extracted directly from the fetched HTML, before scoring. */
export interface ScrapedPage {
  status: number;
  responseTimeMs: number;
  html: string;
  finalUrl: string;
  redirected: boolean;
  contentType: string;
}

/** Uniform shape for every error the API can return. */
export interface ApiErrorPayload {
  error: {
    code: ErrorCode;
    message: string;
  };
}

export type ErrorCode =
  | 'INVALID_URL'
  | 'VALIDATION_ERROR'
  | 'DNS_FAILURE'
  | 'TIMEOUT'
  | 'CONNECTION_REFUSED'
  | 'NOT_FOUND'
  | 'NON_HTML_CONTENT'
  | 'UPSTREAM_ERROR'
  | 'INTERNAL_ERROR';

/** Custom error class carrying an HTTP status + machine-readable code. */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: ErrorCode;

  constructor(code: ErrorCode, message: string, statusCode = 400) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

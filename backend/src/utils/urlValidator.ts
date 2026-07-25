import { AppError } from '../types';

/**
 * Normalizes a user-supplied URL string and validates it is a well-formed,
 * public HTTP(S) URL. Throws AppError('INVALID_URL', ...) on anything else.
 *
 * This runs BEFORE any network call, so obviously bad input never reaches
 * the scraper — it's the first line of defense mentioned in the error
 * handling requirements.
 */
export function normalizeAndValidateUrl(rawUrl: string): string {
  if (!rawUrl || typeof rawUrl !== 'string' || !rawUrl.trim()) {
    throw new AppError('INVALID_URL', 'A URL is required.');
  }

  let candidate = rawUrl.trim();

  // Default to https:// if no protocol was supplied (common UX pattern:
  // users type "example.com" not "https://example.com").
  if (!/^https?:\/\//i.test(candidate)) {
    candidate = `https://${candidate}`;
  }

  let parsed: URL;
  try {
    parsed = new URL(candidate);
  } catch {
    throw new AppError('INVALID_URL', 'The URL provided is not well-formed.');
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new AppError('INVALID_URL', 'Only http:// and https:// URLs are supported.');
  }

  if (!parsed.hostname || !parsed.hostname.includes('.')) {
    throw new AppError('INVALID_URL', 'The URL must include a valid domain name.');
  }

  // Block obviously internal/loopback targets to avoid SSRF against the
  // server's own network (basic defense-in-depth; not exhaustive).
  const blockedHosts = ['localhost', '127.0.0.1', '0.0.0.0', '::1'];
  if (blockedHosts.includes(parsed.hostname.toLowerCase())) {
    throw new AppError('INVALID_URL', 'This host cannot be analyzed.');
  }

  return parsed.toString();
}

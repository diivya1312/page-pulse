import axios, { AxiosError } from 'axios';
import { AppError, ScrapedPage } from '../types';

const FETCH_TIMEOUT_MS = Number(process.env.FETCH_TIMEOUT_MS) || 8000;
const MAX_REDIRECTS = Number(process.env.MAX_REDIRECTS) || 5;
const USER_AGENT = process.env.USER_AGENT || 'PagePulseBot/1.0 (+https://pagepulse.app)';

/**
 * Fetches a URL and returns the raw HTML plus network metadata (status,
 * timing, final URL after redirects, content type).
 *
 * Every failure mode called out in the spec — DNS failure, timeout,
 * connection refused, non-2xx status, non-HTML content — is caught here
 * and re-thrown as a typed AppError so the controller/error handler never
 * has to deal with raw axios/Node errors.
 */
export async function fetchPage(url: string): Promise<ScrapedPage> {
  const startedAt = process.hrtime.bigint();

  try {
    const response = await axios.get<string>(url, {
      timeout: FETCH_TIMEOUT_MS,
      maxRedirects: MAX_REDIRECTS,
      responseType: 'text',
      // Accept any status so we can inspect it ourselves rather than
      // having axios throw for 404/500 — we want to report those, not crash.
      validateStatus: () => true,
      headers: {
        'User-Agent': USER_AGENT,
        Accept: 'text/html,application/xhtml+xml',
      },
      // Guard against axios trying to decompress/parse huge binary payloads.
      maxContentLength: 15 * 1024 * 1024, // 15MB
    });

    const responseTimeMs = elapsedMs(startedAt);
    const contentType = String(response.headers['content-type'] || '').toLowerCase();
    const finalUrl = resolveFinalUrl(response, url);
    const redirected = finalUrl !== url;

    if (response.status === 404) {
      throw new AppError('NOT_FOUND', `The page returned a 404 Not Found (${finalUrl}).`, 404);
    }

    if (response.status >= 500) {
      throw new AppError(
        'UPSTREAM_ERROR',
        `The target site returned a server error (HTTP ${response.status}).`,
        502
      );
    }

    if (response.status >= 400) {
      throw new AppError(
        'UPSTREAM_ERROR',
        `The target site returned HTTP ${response.status}.`,
        502
      );
    }

    if (!contentType.includes('text/html')) {
      throw new AppError(
        'NON_HTML_CONTENT',
        `The URL did not return an HTML page (content-type: ${contentType || 'unknown'}).`,
        422
      );
    }

    return {
      status: response.status,
      responseTimeMs,
      html: response.data,
      finalUrl,
      redirected,
      contentType,
    };
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw mapAxiosError(err, url);
  }
}

function elapsedMs(startedAt: bigint): number {
  const endedAt = process.hrtime.bigint();
  return Number(endedAt - startedAt) / 1_000_000;
}

/** Axios exposes the final redirected URL via request.res.responseUrl (Node) */
function resolveFinalUrl(response: { request?: { res?: { responseUrl?: string } } }, fallback: string): string {
  return response.request?.res?.responseUrl || fallback;
}

/** Translates low-level axios/Node network errors into typed AppErrors. */
function mapAxiosError(err: unknown, url: string): AppError {
  const axiosErr = err as AxiosError;

  if (axiosErr?.code === 'ECONNABORTED' || axiosErr?.message?.includes('timeout')) {
    return new AppError('TIMEOUT', `The request to ${url} timed out after ${FETCH_TIMEOUT_MS}ms.`, 504);
  }

  if (axiosErr?.code === 'ENOTFOUND' || axiosErr?.code === 'EAI_AGAIN') {
    return new AppError('DNS_FAILURE', `Could not resolve the domain for ${url}.`, 502);
  }

  if (axiosErr?.code === 'ECONNREFUSED' || axiosErr?.code === 'ECONNRESET') {
    return new AppError('CONNECTION_REFUSED', `The connection to ${url} was refused or reset.`, 502);
  }

  if (axiosErr?.code === 'ERR_FR_TOO_MANY_REDIRECTS' || axiosErr?.message?.includes('redirects')) {
    return new AppError('UPSTREAM_ERROR', `Too many redirects while fetching ${url}.`, 502);
  }

  if (axiosErr?.code === 'CERT_HAS_EXPIRED' || axiosErr?.code === 'DEPTH_ZERO_SELF_SIGNED_CERT') {
    return new AppError('UPSTREAM_ERROR', `The site's SSL certificate could not be verified.`, 502);
  }

  return new AppError('UPSTREAM_ERROR', `Failed to fetch ${url}: ${axiosErr?.message || 'unknown network error'}.`, 502);
}

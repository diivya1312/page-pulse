import { ApiError } from '../types';

interface ErrorAlertProps {
  error: ApiError;
}

// Plain-language copy per error code — the interface explains what went
// wrong in its own voice rather than surfacing a raw backend message.
const FRIENDLY_MESSAGES: Record<string, string> = {
  INVALID_URL: "That doesn't look like a valid website address. Double-check the URL and try again.",
  VALIDATION_ERROR: 'Enter a URL before analyzing.',
  DNS_FAILURE: "This domain couldn't be found. Check the spelling, or the site may no longer exist.",
  TIMEOUT: 'The site took too long to respond. It may be slow or temporarily unavailable.',
  CONNECTION_REFUSED: 'The connection was refused by the server. The site may be down.',
  NOT_FOUND: "That page returned a 404 — it doesn't exist at this address.",
  NON_HTML_CONTENT: "That URL doesn't point to an HTML page (it might be a file or API endpoint).",
  UPSTREAM_ERROR: 'The target site returned an error. Try again in a moment.',
  NETWORK_ERROR: 'Could not reach the Page Pulse API. Check your connection and try again.',
  INTERNAL_ERROR: 'Something went wrong on our end. Please try again.',
};

export default function ErrorAlert({ error }: ErrorAlertProps) {
  const message = FRIENDLY_MESSAGES[error.code] || error.message;

  return (
    <div
      role="alert"
      className="glass-card flex items-start gap-3 border-danger/30 bg-danger/5 px-5 py-4 animate-fade-up
                 dark:bg-danger/10"
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="mt-0.5 shrink-0 text-danger"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M12 8v5M12 16h.01" strokeLinecap="round" />
      </svg>
      <div>
        <p className="font-display text-sm font-semibold text-danger">Couldn&apos;t complete that audit</p>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{message}</p>
        <p className="mt-1 font-mono text-xs text-slate-400 dark:text-slate-500">{error.code}</p>
      </div>
    </div>
  );
}

import { AnalyzeResult } from '../types';
import { getStatusTier } from '../utils/scoring';
import { copyResultAsJson, exportResultAsPdf } from '../utils/export';
import { useState } from 'react';
import ScoreBadge from './ScoreBadge';
import ResultCard from './ResultCard';

interface ResultsGridProps {
  result: AnalyzeResult;
}

export default function ResultsGrid({ result }: ResultsGridProps) {
  const [copied, setCopied] = useState(false);
  const statusTier = getStatusTier(result.status);

  const handleCopy = async () => {
    const ok = await copyResultAsJson(result);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="animate-fade-up space-y-6">
      {/* Header: URL, status badge, and bonus actions */}
      <div className="glass-card glass-card-light-border flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className={`readout rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusTier.bgClass} ${statusTier.textClass}`}>
              HTTP {result.status}
            </span>
            {result.redirected && (
              <span className="rounded-full bg-volt/10 px-2.5 py-0.5 text-xs font-medium text-volt dark:text-volt-soft">
                Redirected
              </span>
            )}
          </div>
          <p className="mt-2 truncate font-mono text-sm text-slate-500 dark:text-slate-400">{result.finalUrl}</p>
        </div>
        <div className="flex shrink-0 gap-2">
          <button type="button" onClick={handleCopy} className="btn-ghost">
            {copied ? (
              <>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Copied
              </>
            ) : (
              <>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" />
                  <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                </svg>
                Copy JSON
              </>
            )}
          </button>
          <button type="button" onClick={() => exportResultAsPdf(result)} className="btn-ghost">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 3v12m0 0l-4-4m4 4l4-4M4 21h16" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Export PDF
          </button>
        </div>
      </div>

      {/* Score badges — bonus SEO / performance scores with color indicators */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-2">
        <ScoreBadge label="SEO Score" score={result.seoScore} />
        <ScoreBadge label="Performance" score={result.performanceScore} />
      </div>

      {/* Title / meta description panel */}
      <div className="glass-card glass-card-light-border grid gap-5 p-5 sm:grid-cols-2">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">Page Title</p>
          <p className="mt-1 text-sm font-medium text-slate-700 dark:text-slate-200">{result.title}</p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">Meta Description</p>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{result.metaDescription}</p>
        </div>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <ResultCard
          label="Response Time"
          value={result.responseTime}
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 7v5l3 3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          }
        />
        <ResultCard
          label="H1 Tags"
          value={result.h1Count}
          tone={result.h1Count === 1 ? 'good' : result.h1Count === 0 ? 'bad' : 'warn'}
          sublabel={result.h1Count === 1 ? 'Ideal' : result.h1Count === 0 ? 'Missing' : 'Multiple found'}
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 6v12M16 6v12M4 12h12" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          }
        />
        <ResultCard
          label="Missing ALT Text"
          value={`${result.missingAltImages} / ${result.totalImages}`}
          tone={result.missingAltImages === 0 ? 'good' : 'bad'}
          sublabel={result.totalImages === 0 ? 'No images found' : undefined}
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="9" cy="9" r="2" />
              <path d="M21 15l-5-5L5 21" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          }
        />
        <ResultCard
          label="Word Count"
          value={result.wordCount.toLocaleString()}
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 6h16M4 12h16M4 18h10" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          }
        />
        <ResultCard
          label="Content Type"
          value={result.contentType.split(';')[0]}
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" strokeLinejoin="round" />
              <path d="M14 2v6h6" strokeLinejoin="round" />
            </svg>
          }
        />
        <ResultCard
          label="Fetched At"
          value={new Date(result.fetchedAt).toLocaleTimeString()}
          sublabel={new Date(result.fetchedAt).toLocaleDateString()}
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <path d="M16 2v4M8 2v4M3 10h18" strokeLinecap="round" />
            </svg>
          }
        />
      </div>
    </div>
  );
}

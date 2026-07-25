import { useCallback, useEffect } from 'react';
import Hero from '../components/Hero';
import LoadingAnimation from '../components/LoadingAnimation';
import ErrorAlert from '../components/ErrorAlert';
import ResultsGrid from '../components/ResultsGrid';
import RecentSearches from '../components/RecentSearches';
import DarkModeToggle from '../components/DarkModeToggle';
import { useAnalyze } from '../hooks/useAnalyze';
import { useHistory } from '../hooks/useHistory';
import { useDarkMode } from '../hooks/useDarkMode';

export default function Dashboard() {
  const { status, result, error, analyze, isLoading } = useAnalyze();
  const { history, addEntry, clearHistory } = useHistory();
  const { isDark, toggle } = useDarkMode();

  useEffect(() => {
    if (status === 'success' && result) {
      addEntry(result);
    }
  }, [status, result, addEntry]);

  const handleAnalyze = useCallback(
    (url: string) => {
      analyze(url);
    },
    [analyze]
  );

  return (
    <div className="min-h-screen bg-paper text-slate-900 transition-colors duration-300 dark:bg-ink dark:text-white">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-6 pt-6">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-pulse text-ink">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M3 12h4l2-8 4 16 2-8h6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <span className="font-display text-lg font-semibold">Page Pulse</span>
        </div>
        <DarkModeToggle isDark={isDark} onToggle={toggle} />
      </header>

      <main>
        <Hero onAnalyze={handleAnalyze} isLoading={isLoading} />

        <div className="mx-auto max-w-5xl px-6 pb-24">
          <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
            <div>
              {status === 'loading' && <LoadingAnimation />}
              {status === 'error' && error && <ErrorAlert error={error} />}
              {status === 'success' && result && <ResultsGrid result={result} />}
              {status === 'idle' && (
                <div className="glass-card glass-card-light-border flex flex-col items-center gap-2 px-6 py-16 text-center text-slate-400 dark:text-slate-500">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M3 12h4l2-8 4 16 2-8h6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <p className="text-sm">Enter a URL above to run your first audit.</p>
                </div>
              )}
            </div>

            <aside className="lg:pt-0">
              <RecentSearches history={history} onSelect={handleAnalyze} onClear={clearHistory} />
            </aside>
          </div>
        </div>
      </main>

      <footer className="border-t border-paper-line py-8 text-center text-xs text-slate-400 dark:border-white/10 dark:text-slate-500">
        Page Pulse — built with React, Express, and Cheerio.
      </footer>
    </div>
  );
}

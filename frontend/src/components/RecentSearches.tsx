import { HistoryEntry } from '../types';
import { getScoreTier } from '../utils/scoring';

interface RecentSearchesProps {
  history: HistoryEntry[];
  onSelect: (url: string) => void;
  onClear: () => void;
}

export default function RecentSearches({ history, onSelect, onClear }: RecentSearchesProps) {
  if (history.length === 0) return null;

  return (
    <div className="glass-card glass-card-light-border p-5 animate-fade-up">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-600 dark:text-slate-300">Recent searches</h2>
        <button
          type="button"
          onClick={onClear}
          className="text-xs font-medium text-slate-400 transition-colors hover:text-danger dark:text-slate-500"
        >
          Clear
        </button>
      </div>
      <ul className="flex flex-col divide-y divide-paper-line dark:divide-white/10">
        {history.map((entry) => {
          const tier = getScoreTier(entry.seoScore);
          return (
            <li key={entry.id}>
              <button
                type="button"
                onClick={() => onSelect(entry.url)}
                className="flex w-full items-center justify-between gap-3 rounded-lg px-2 py-2.5 text-left
                           transition-colors hover:bg-slate-100 dark:hover:bg-white/5"
              >
                <span className="min-w-0 truncate font-mono text-sm text-slate-600 dark:text-slate-300">
                  {entry.url.replace(/^https?:\/\//, '')}
                </span>
                <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${tier.bgClass} ${tier.textClass}`}>
                  {entry.seoScore}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

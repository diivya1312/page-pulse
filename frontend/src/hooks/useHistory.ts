import { useCallback, useEffect, useState } from 'react';
import { AnalyzeResult, HistoryEntry } from '../types';

const STORAGE_KEY = 'page-pulse:history';
const MAX_ENTRIES = 8;

function loadHistory(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as HistoryEntry[]) : [];
  } catch {
    return [];
  }
}

/**
 * Persists a small "recent searches" list to localStorage. This is purely
 * a client-side convenience feature (bonus requirement) — no PII, no
 * server storage, so it's safe to keep dependency-free.
 */
export function useHistory() {
  const [history, setHistory] = useState<HistoryEntry[]>(() => loadHistory());

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  }, [history]);

  const addEntry = useCallback((result: AnalyzeResult) => {
    setHistory((prev) => {
      const deduped = prev.filter((entry) => entry.url !== result.url);
      const next: HistoryEntry = {
        id: `${result.url}-${result.fetchedAt}`,
        url: result.url,
        fetchedAt: result.fetchedAt,
        seoScore: result.seoScore,
        performanceScore: result.performanceScore,
        status: result.status,
      };
      return [next, ...deduped].slice(0, MAX_ENTRIES);
    });
  }, []);

  const clearHistory = useCallback(() => setHistory([]), []);

  return { history, addEntry, clearHistory };
}

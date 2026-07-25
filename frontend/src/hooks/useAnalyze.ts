import { useCallback, useState } from 'react';
import { analyzeWebsite } from '../services/api';
import { AnalyzeResult, ApiError } from '../types';

type Status = 'idle' | 'loading' | 'success' | 'error';

interface UseAnalyzeState {
  status: Status;
  result: AnalyzeResult | null;
  error: ApiError | null;
}

/**
 * Owns the request lifecycle for a single audit: idle → loading → success/error.
 * Keeping this in a hook (rather than inline in the page component) means the
 * fetch logic is reusable and independently testable.
 */
export function useAnalyze() {
  const [state, setState] = useState<UseAnalyzeState>({
    status: 'idle',
    result: null,
    error: null,
  });

  const analyze = useCallback(async (url: string) => {
    setState({ status: 'loading', result: null, error: null });
    try {
      const result = await analyzeWebsite(url);
      setState({ status: 'success', result, error: null });
      return result;
    } catch (err) {
      setState({ status: 'error', result: null, error: err as ApiError });
      return null;
    }
  }, []);

  const reset = useCallback(() => setState({ status: 'idle', result: null, error: null }), []);

  return { ...state, analyze, reset, isLoading: state.status === 'loading' };
}

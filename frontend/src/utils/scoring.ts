export type ScoreTier = 'excellent' | 'good' | 'needs-work' | 'poor';

export interface ScoreTierInfo {
  tier: ScoreTier;
  label: string;
  textClass: string;
  ringClass: string;
  bgClass: string;
}

/** Maps a 0-100 score into a consistent visual tier used across the UI. */
export function getScoreTier(score: number): ScoreTierInfo {
  if (score >= 90) {
    return { tier: 'excellent', label: 'Excellent', textClass: 'text-pulse-dim dark:text-pulse-soft', ringClass: 'stroke-pulse', bgClass: 'bg-pulse/10' };
  }
  if (score >= 70) {
    return { tier: 'good', label: 'Good', textClass: 'text-volt dark:text-volt-soft', ringClass: 'stroke-volt', bgClass: 'bg-volt/10' };
  }
  if (score >= 50) {
    return { tier: 'needs-work', label: 'Needs work', textClass: 'text-warn', ringClass: 'stroke-warn', bgClass: 'bg-warn/10' };
  }
  return { tier: 'poor', label: 'Poor', textClass: 'text-danger', ringClass: 'stroke-danger', bgClass: 'bg-danger/10' };
}

/** HTTP status → color indicator, used on the status badge. */
export function getStatusTier(status: number): ScoreTierInfo {
  if (status >= 200 && status < 300) return getScoreTier(95);
  if (status >= 300 && status < 400) return getScoreTier(75);
  return getScoreTier(20);
}

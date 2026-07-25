import { getScoreTier } from '../utils/scoring';

interface ScoreBadgeProps {
  label: string;
  score: number;
}

const RADIUS = 34;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function ScoreBadge({ label, score }: ScoreBadgeProps) {
  const tier = getScoreTier(score);
  const offset = CIRCUMFERENCE - (score / 100) * CIRCUMFERENCE;

  return (
    <div className={`glass-card glass-card-light-border flex flex-col items-center gap-3 p-5 ${tier.bgClass}`}>
      <div className="relative h-20 w-20">
        <svg viewBox="0 0 80 80" className="h-20 w-20 -rotate-90">
          <circle cx="40" cy="40" r={RADIUS} strokeWidth="7" className="stroke-slate-200 dark:stroke-white/10" fill="none" />
          <circle
            cx="40"
            cy="40"
            r={RADIUS}
            strokeWidth="7"
            fill="none"
            strokeLinecap="round"
            className={`${tier.ringClass} transition-all duration-700 ease-out`}
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={offset}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`readout text-lg font-semibold ${tier.textClass}`}>{score}</span>
        </div>
      </div>
      <div className="text-center">
        <p className="text-sm font-medium text-slate-600 dark:text-slate-300">{label}</p>
        <p className={`text-xs font-medium ${tier.textClass}`}>{tier.label}</p>
      </div>
    </div>
  );
}

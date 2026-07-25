import { ReactNode } from 'react';

interface ResultCardProps {
  label: string;
  value: ReactNode;
  icon: ReactNode;
  tone?: 'default' | 'good' | 'warn' | 'bad';
  sublabel?: string;
}

const TONE_CLASSES: Record<NonNullable<ResultCardProps['tone']>, string> = {
  default: 'text-slate-700 dark:text-slate-200',
  good: 'text-pulse-dim dark:text-pulse-soft',
  warn: 'text-warn',
  bad: 'text-danger',
};

/**
 * A single stat card. Deliberately generic (icon + label + value + optional
 * sublabel) so every metric in the audit — H1 count, word count, missing
 * ALT tags, etc. — reuses the same component instead of one-off markup.
 */
export default function ResultCard({ label, value, icon, tone = 'default', sublabel }: ResultCardProps) {
  return (
    <div className="glass-card glass-card-light-border flex items-start gap-4 p-5">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500 dark:bg-white/5 dark:text-slate-400">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">{label}</p>
        <p className={`readout mt-1 truncate text-xl font-semibold ${TONE_CLASSES[tone]}`}>{value}</p>
        {sublabel && <p className="mt-0.5 truncate text-xs text-slate-400 dark:text-slate-500">{sublabel}</p>}
      </div>
    </div>
  );
}

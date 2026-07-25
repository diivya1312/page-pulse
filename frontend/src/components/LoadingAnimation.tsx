import PulseLine from './PulseLine';

export default function LoadingAnimation() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="glass-card glass-card-light-border flex flex-col items-center gap-4 px-6 py-16 text-center animate-fade-up"
    >
      <div className="w-full max-w-md text-pulse dark:text-pulse-soft">
        <PulseLine className="h-14 w-full" animated />
      </div>
      <p className="font-mono text-sm text-slate-500 dark:text-slate-400">
        Reading vitals<span className="animate-pulse">…</span>
      </p>
      <p className="text-xs text-slate-400 dark:text-slate-500">
        Fetching the page, checking headers, and parsing content
      </p>
    </div>
  );
}

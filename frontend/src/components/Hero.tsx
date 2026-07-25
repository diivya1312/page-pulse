import PulseLine from './PulseLine';
import UrlForm from './UrlForm';

interface HeroProps {
  onAnalyze: (url: string) => void;
  isLoading: boolean;
}

export default function Hero({ onAnalyze, isLoading }: HeroProps) {
  return (
    <section className="relative overflow-hidden">
      {/* Ambient gradient backdrop — the "gradient hero" requirement, tuned to the ink/pulse palette */}
      <div
        className="absolute inset-0 -z-10 bg-gradient-to-b from-pulse/10 via-transparent to-transparent
                   dark:from-pulse/[0.08]"
        aria-hidden="true"
      />
      <div
        className="absolute -top-40 left-1/2 -z-10 h-[520px] w-[900px] -translate-x-1/2 rounded-full
                   bg-gradient-to-tr from-pulse/20 via-volt/10 to-transparent blur-3xl"
        aria-hidden="true"
      />

      <div className="mx-auto flex max-w-3xl flex-col items-center px-6 pb-16 pt-20 text-center sm:pt-28">
        <span
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-pulse/30 bg-pulse/10
                     px-3 py-1 font-mono text-xs font-medium text-pulse-dim dark:text-pulse-soft"
        >
          <span className="h-1.5 w-1.5 animate-glow rounded-full bg-pulse" />
          live diagnostics
        </span>

        <h1 className="text-4xl font-semibold leading-tight text-ink dark:text-white sm:text-5xl">
          Know your site&apos;s vitals in seconds
        </h1>
        <p className="mt-4 max-w-xl text-base text-slate-500 dark:text-slate-400 sm:text-lg">
          Drop in any URL. Page Pulse checks response time, on-page SEO signals, and accessibility
          gaps — and reads back a clean report.
        </p>

        <div className="my-10 w-full max-w-2xl text-pulse dark:text-pulse-soft">
          <PulseLine className="h-16 w-full opacity-70" animated />
        </div>

        <div className="w-full max-w-2xl">
          <UrlForm onSubmit={onAnalyze} isLoading={isLoading} />
        </div>
      </div>
    </section>
  );
}

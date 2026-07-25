interface PulseLineProps {
  className?: string;
  animated?: boolean;
}

/**
 * A single reusable ECG-style waveform. This is the "signature element" of
 * the design (per the brief: Page Pulse = a vitals monitor for websites),
 * so the same path is reused across the hero backdrop and the loading
 * state rather than inventing a separate spinner.
 */
export default function PulseLine({ className = '', animated = true }: PulseLineProps) {
  return (
    <svg
      viewBox="0 0 600 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M0 60 H140 L165 15 L195 105 L225 40 L250 60 H320 L345 25 L375 95 L400 60 H600"
        stroke="currentColor"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        pathLength={1000}
        strokeDasharray={animated ? 1000 : undefined}
        className={animated ? 'animate-pulse-line' : ''}
      />
    </svg>
  );
}

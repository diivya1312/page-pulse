import { useForm } from 'react-hook-form';
import { AnalyzeFormValues } from '../types';

interface UrlFormProps {
  onSubmit: (url: string) => void;
  isLoading: boolean;
}

// Loose client-side check — the backend is the source of truth for real
// validation. This just catches empty/obviously-wrong input fast, without
// duplicating server logic.
const URL_PATTERN = /^(https?:\/\/)?[a-z0-9-]+(\.[a-z0-9-]+)+([/?#][^\s]*)?$/i;

export default function UrlForm({ onSubmit, isLoading }: UrlFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AnalyzeFormValues>({ mode: 'onSubmit' });

  const submit = handleSubmit((values) => onSubmit(values.url.trim()));

  return (
    <form onSubmit={submit} noValidate className="w-full">
      <div
        className="glass-card glass-card-light-border flex flex-col gap-3 p-2.5 sm:flex-row sm:items-center
                   sm:p-2"
      >
        <div className="flex flex-1 items-center gap-3 px-3 py-2">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="shrink-0 text-slate-400 dark:text-slate-500"
            aria-hidden="true"
          >
            <path d="M13 17a4 4 0 11-4-4M13 17l6-6M13 17l-3-3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <input
            {...register('url', {
              required: 'Enter a URL to analyze.',
              pattern: { value: URL_PATTERN, message: 'Enter a valid website address, e.g. example.com' },
            })}
            type="text"
            inputMode="url"
            autoComplete="url"
            placeholder="example.com or https://example.com"
            aria-label="Website URL"
            aria-invalid={Boolean(errors.url)}
            className="w-full bg-transparent font-mono text-sm text-slate-800 outline-none
                       placeholder:text-slate-400 dark:text-slate-100 dark:placeholder:text-slate-500 sm:text-base"
          />
        </div>
        <button type="submit" disabled={isLoading} className="btn-primary shrink-0">
          {isLoading ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-ink/30 border-t-ink" />
              Analyzing
            </>
          ) : (
            <>
              Analyze
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M13 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </>
          )}
        </button>
      </div>
      {errors.url && (
        <p role="alert" className="mt-2 pl-2 text-sm font-medium text-danger">
          {errors.url.message}
        </p>
      )}
    </form>
  );
}

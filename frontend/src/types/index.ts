/** Mirrors backend AnalyzeResult — the shape of a successful audit. */
export interface AnalyzeResult {
  url: string;
  status: number;
  responseTime: string;
  title: string;
  metaDescription: string;
  h1Count: number;
  missingAltImages: number;
  totalImages: number;
  wordCount: number;
  seoScore: number;
  performanceScore: number;
  redirected: boolean;
  finalUrl: string;
  contentType: string;
  fetchedAt: string;
}

/** Uniform error envelope returned by the API on any failure. */
export interface ApiError {
  code: string;
  message: string;
}

export interface HistoryEntry {
  id: string;
  url: string;
  fetchedAt: string;
  seoScore: number;
  performanceScore: number;
  status: number;
}

export type AnalyzeFormValues = {
  url: string;
};

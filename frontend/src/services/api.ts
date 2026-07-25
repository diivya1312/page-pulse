import axios, { AxiosError } from 'axios';
import { AnalyzeResult, ApiError } from '../types';

// In production, set VITE_API_BASE_URL to the deployed Render URL.
// In dev, Vite's proxy (vite.config.ts) forwards /api to localhost:5000.
const baseURL = import.meta.env.VITE_API_BASE_URL || '';

const client = axios.create({
  baseURL,
  timeout: 20000, // generous client-side ceiling; the server enforces its own fetch timeout
  headers: { 'Content-Type': 'application/json' },
});

/** Normalizes any axios failure into our ApiError shape for the UI to render. */
function toApiError(err: unknown): ApiError {
  const axiosErr = err as AxiosError<{ error?: ApiError }>;
  if (axiosErr.response?.data?.error) {
    return axiosErr.response.data.error;
  }
  if (axiosErr.code === 'ECONNABORTED') {
    return { code: 'TIMEOUT', message: 'The request took too long. Please try again.' };
  }
  return { code: 'NETWORK_ERROR', message: 'Could not reach the Page Pulse API. Check your connection.' };
}

/** Calls POST /api/analyze and returns the audit result, or throws an ApiError. */
export async function analyzeWebsite(url: string): Promise<AnalyzeResult> {
  try {
    const { data } = await client.post<AnalyzeResult>('/api/analyze', { url });
    return data;
  } catch (err) {
    throw toApiError(err);
  }
}

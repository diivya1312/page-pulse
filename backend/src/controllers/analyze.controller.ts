import { NextFunction, Request, Response } from 'express';
import { normalizeAndValidateUrl } from '../utils/urlValidator';
import { fetchPage } from '../services/scraper.service';
import { analyzePage } from '../services/analyzer.service';
import { AnalyzeResult } from '../types';

/**
 * POST /api/analyze
 * Orchestrates the three steps of an audit: validate the URL, fetch the
 * page, and derive metrics from the HTML. Thin by design — all real logic
 * lives in the service layer so this controller stays testable and
 * easy to reason about (Single Responsibility Principle).
 */
export async function analyzeUrl(
  req: Request<unknown, unknown, { url: string }>,
  res: Response<AnalyzeResult>,
  next: NextFunction
): Promise<void> {
  try {
    const targetUrl = normalizeAndValidateUrl(req.body.url);
    const page = await fetchPage(targetUrl);
    const result = analyzePage(page, targetUrl);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

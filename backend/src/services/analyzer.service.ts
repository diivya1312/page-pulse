import * as cheerio from 'cheerio';
import { AnalyzeResult, ScrapedPage } from '../types';

/**
 * Turns a raw ScrapedPage (HTML + network metadata) into the final
 * AnalyzeResult the API returns. Pure function — no I/O — so it's trivial
 * to unit test in isolation from the network layer.
 */
export function analyzePage(page: ScrapedPage, requestedUrl: string): AnalyzeResult {
  const $ = cheerio.load(page.html);

  const title = $('title').first().text().trim();
  const metaDescription =
    $('meta[name="description"]').attr('content')?.trim() ||
    $('meta[property="og:description"]').attr('content')?.trim() ||
    '';

  const h1Count = $('h1').length;

  const images = $('img');
  const totalImages = images.length;
  let missingAltImages = 0;
  images.each((_, el) => {
    const alt = $(el).attr('alt');
    if (alt === undefined || alt.trim() === '') missingAltImages += 1;
  });

  const wordCount = countWords($, page.html);

  const seoScore = computeSeoScore({ title, metaDescription, h1Count, missingAltImages, totalImages });
  const performanceScore = computePerformanceScore(page.responseTimeMs);

  return {
    url: requestedUrl,
    status: page.status,
    responseTime: `${Math.round(page.responseTimeMs)}ms`,
    title: title || '(no title tag found)',
    metaDescription: metaDescription || '(no meta description found)',
    h1Count,
    missingAltImages,
    totalImages,
    wordCount,
    seoScore,
    performanceScore,
    redirected: page.redirected,
    finalUrl: page.finalUrl,
    contentType: page.contentType,
    fetchedAt: new Date().toISOString(),
  };
}

/**
 * Approximate word count of visible body text. We strip script/style/noscript
 * tags (they aren't "content") and split on whitespace, which is the same
 * heuristic most readability tools use.
 */
function countWords($: cheerio.CheerioAPI, _html: string): number {
  const clone = $.root().clone();
  clone.find('script, style, noscript, template').remove();
  const text = clone.text().replace(/\s+/g, ' ').trim();
  if (!text) return 0;
  return text.split(' ').filter(Boolean).length;
}

/**
 * A lightweight, explainable 0-100 SEO score. This is intentionally simple
 * and deterministic rather than a black box — each factor is documented so
 * the score is defensible, not "AI magic."
 */
function computeSeoScore(input: {
  title: string;
  metaDescription: string;
  h1Count: number;
  missingAltImages: number;
  totalImages: number;
}): number {
  let score = 100;

  if (!input.title) score -= 25;
  else if (input.title.length < 10 || input.title.length > 70) score -= 10;

  if (!input.metaDescription) score -= 20;
  else if (input.metaDescription.length < 50 || input.metaDescription.length > 160) score -= 8;

  if (input.h1Count === 0) score -= 20;
  else if (input.h1Count > 1) score -= 10;

  if (input.totalImages > 0) {
    const missingRatio = input.missingAltImages / input.totalImages;
    score -= Math.round(missingRatio * 25);
  }

  return clampScore(score);
}

/** Maps raw response time to a 0-100 performance score using simple bands. */
function computePerformanceScore(responseTimeMs: number): number {
  if (responseTimeMs <= 300) return 100;
  if (responseTimeMs <= 600) return 90;
  if (responseTimeMs <= 1000) return 75;
  if (responseTimeMs <= 2000) return 55;
  if (responseTimeMs <= 3500) return 35;
  return 15;
}

function clampScore(score: number): number {
  return Math.max(0, Math.min(100, Math.round(score)));
}

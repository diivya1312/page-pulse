import jsPDF from 'jspdf';
import { AnalyzeResult } from '../types';

/** Copies the raw audit JSON to the clipboard. Returns success/failure. */
export async function copyResultAsJson(result: AnalyzeResult): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(JSON.stringify(result, null, 2));
    return true;
  } catch {
    return false;
  }
}

/** Generates a simple one-page PDF summary of the audit and triggers a download. */
export function exportResultAsPdf(result: AnalyzeResult): void {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const marginX = 48;
  let y = 64;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor('#0B1120');
  doc.text('Page Pulse — Audit Report', marginX, y);

  y += 28;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor('#475569');
  doc.text(result.url, marginX, y);

  y += 14;
  doc.text(`Generated ${new Date(result.fetchedAt).toLocaleString()}`, marginX, y);

  y += 32;
  doc.setDrawColor('#E2E8F0');
  doc.line(marginX, y, 547, y);
  y += 32;

  const rows: [string, string][] = [
    ['HTTP Status', String(result.status)],
    ['Response Time', result.responseTime],
    ['SEO Score', `${result.seoScore} / 100`],
    ['Performance Score', `${result.performanceScore} / 100`],
    ['Page Title', result.title],
    ['Meta Description', result.metaDescription],
    ['H1 Tags', String(result.h1Count)],
    ['Images Missing ALT', `${result.missingAltImages} of ${result.totalImages}`],
    ['Approx. Word Count', String(result.wordCount)],
    ['Redirected', result.redirected ? `Yes → ${result.finalUrl}` : 'No'],
  ];

  doc.setFontSize(12);
  rows.forEach(([label, value]) => {
    doc.setFont('helvetica', 'bold');
    doc.setTextColor('#0B1120');
    doc.text(label, marginX, y);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor('#334155');
    const wrapped = doc.splitTextToSize(value || '—', 300);
    doc.text(wrapped, marginX + 180, y);

    y += 18 * (Array.isArray(wrapped) ? wrapped.length : 1) + 6;
  });

  const filename = `page-pulse-${new URL(result.url).hostname}-${Date.now()}.pdf`;
  doc.save(filename);
}

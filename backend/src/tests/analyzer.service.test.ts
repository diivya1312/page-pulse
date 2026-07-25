import { analyzePage } from '../services/analyzer.service';
import { ScrapedPage } from '../types';

function makePage(html: string, overrides: Partial<ScrapedPage> = {}): ScrapedPage {
  return {
    status: 200,
    responseTimeMs: 250,
    html,
    finalUrl: 'https://example.com',
    redirected: false,
    contentType: 'text/html; charset=utf-8',
    ...overrides,
  };
}

describe('analyzePage (pure unit tests)', () => {
  it('extracts title, meta description, h1 count, and image alt gaps', () => {
    const html = `
      <html><head><title>Hello World</title>
      <meta name="description" content="A short description of the page." /></head>
      <body>
        <h1>Main heading</h1>
        <img src="a.png" alt="Photo of a cat" />
        <img src="b.png" alt="" />
        <img src="c.png" />
        <p>Some visible words here for counting purposes.</p>
      </body></html>
    `;
    const result = analyzePage(makePage(html), 'https://example.com');

    expect(result.title).toBe('Hello World');
    expect(result.metaDescription).toBe('A short description of the page.');
    expect(result.h1Count).toBe(1);
    expect(result.totalImages).toBe(3);
    expect(result.missingAltImages).toBe(2); // empty alt + missing alt
  });

  it('falls back to placeholders when title/description are absent', () => {
    const html = `<html><head></head><body><p>No title here.</p></body></html>`;
    const result = analyzePage(makePage(html), 'https://example.com');

    expect(result.title).toBe('(no title tag found)');
    expect(result.metaDescription).toBe('(no meta description found)');
    expect(result.h1Count).toBe(0);
  });

  it('excludes script and style content from the word count', () => {
    const html = `
      <html><head><title>T</title></head>
      <body>
        <script>var x = "this should not be counted as words";</script>
        <style>.a { color: red; }</style>
        <p>Four real words here</p>
      </body></html>
    `;
    const result = analyzePage(makePage(html), 'https://example.com');
    expect(result.wordCount).toBe(4);
  });

  it('formats response time in whole milliseconds', () => {
    const result = analyzePage(makePage('<html></html>', { responseTimeMs: 432.9 }), 'https://example.com');
    expect(result.responseTime).toBe('433ms');
  });

  it('scores a well-optimized page higher than a poorly-optimized one', () => {
    const good = analyzePage(
      makePage(`
        <html><head><title>A Perfectly Reasonable Page Title</title>
        <meta name="description" content="A meta description that sits comfortably within the ideal length range for SEO purposes." />
        </head><body><h1>One heading</h1><img src="a.png" alt="described" /></body></html>
      `),
      'https://example.com'
    );
    const bad = analyzePage(
      makePage(`<html><head></head><body><img src="a.png" /><img src="b.png" /></body></html>`),
      'https://example.com'
    );

    expect(good.seoScore).toBeGreaterThan(bad.seoScore);
  });
});

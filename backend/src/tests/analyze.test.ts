import request from 'supertest';
import nock from 'nock';
import { createApp } from '../app';

const app = createApp();

const SAMPLE_HTML = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <title>Example Domain</title>
    <meta name="description" content="This domain is for use in illustrative examples in documents." />
  </head>
  <body>
    <h1>Example Domain</h1>
    <p>This domain is established to be used for illustrative examples. You may use this
    domain in literature without prior coordination or asking for permission.</p>
    <img src="/hero.png" alt="Hero banner" />
    <img src="/icon.png" />
    <a href="https://www.iana.org/domains/example">More information...</a>
  </body>
</html>
`;

beforeEach(() => {
  nock.cleanAll();
  nock.disableNetConnect();
});

afterAll(() => {
  nock.enableNetConnect();
});

describe('POST /api/analyze', () => {
  it('happy path: returns a full audit for a valid HTML page', async () => {
    nock('https://example.com').get('/').reply(200, SAMPLE_HTML, { 'Content-Type': 'text/html' });

    const res = await request(app).post('/api/analyze').send({ url: 'https://example.com' });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe(200);
    expect(res.body.title).toBe('Example Domain');
    expect(res.body.metaDescription).toMatch(/illustrative examples/i);
    expect(res.body.h1Count).toBe(1);
    expect(res.body.missingAltImages).toBe(1);
    expect(res.body.totalImages).toBe(2);
    expect(res.body.wordCount).toBeGreaterThan(0);
    expect(res.body.responseTime).toMatch(/^\d+ms$/);
    expect(typeof res.body.seoScore).toBe('number');
    expect(typeof res.body.performanceScore).toBe('number');
  });

  it('rejects a missing url field with a 400 validation error', async () => {
    const res = await request(app).post('/api/analyze').send({});

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('rejects a malformed url with a 400 invalid URL error', async () => {
    const res = await request(app).post('/api/analyze').send({ url: 'not a url at all' });

    // "not a url at all" has no dot, so it fails hostname validation.
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('INVALID_URL');
  });

  it('maps an upstream 404 to a 404 NOT_FOUND response', async () => {
    nock('https://example.com').get('/missing').reply(404, 'Not Found');

    const res = await request(app).post('/api/analyze').send({ url: 'https://example.com/missing' });

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('maps an upstream 500 to a 502 UPSTREAM_ERROR response', async () => {
    nock('https://example.com').get('/broken').reply(500, 'Server Error');

    const res = await request(app).post('/api/analyze').send({ url: 'https://example.com/broken' });

    expect(res.status).toBe(502);
    expect(res.body.error.code).toBe('UPSTREAM_ERROR');
  });

  it('maps a request timeout to a 504 TIMEOUT response', async () => {
    nock('https://slow-example.com')
      .get('/')
      .delayConnection(10000)
      .reply(200, SAMPLE_HTML);

    const res = await request(app).post('/api/analyze').send({ url: 'https://slow-example.com' });

    expect(res.status).toBe(504);
    expect(res.body.error.code).toBe('TIMEOUT');
  }, 15000);

  it('maps a DNS resolution failure to a 502 DNS_FAILURE response', async () => {
    nock('https://does-not-resolve.invalid')
      .get('/')
      .replyWithError({ code: 'ENOTFOUND', message: 'getaddrinfo ENOTFOUND' });

    const res = await request(app).post('/api/analyze').send({ url: 'https://does-not-resolve.invalid' });

    expect(res.status).toBe(502);
    expect(res.body.error.code).toBe('DNS_FAILURE');
  });

  it('rejects non-HTML content with a 422 NON_HTML_CONTENT response', async () => {
    nock('https://example.com')
      .get('/data.json')
      .reply(200, { hello: 'world' }, { 'Content-Type': 'application/json' });

    const res = await request(app).post('/api/analyze').send({ url: 'https://example.com/data.json' });

    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe('NON_HTML_CONTENT');
  });

  it('follows redirects and reports the final URL', async () => {
    nock('https://example.com').get('/old').reply(301, undefined, { Location: 'https://example.com/new' });
    nock('https://example.com').get('/new').reply(200, SAMPLE_HTML, { 'Content-Type': 'text/html' });

    const res = await request(app).post('/api/analyze').send({ url: 'https://example.com/old' });

    expect(res.status).toBe(200);
    expect(res.body.redirected).toBe(true);
    expect(res.body.finalUrl).toBe('https://example.com/new');
  });
});

describe('GET /api/health', () => {
  it('returns 200 ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});

describe('unknown routes', () => {
  it('returns a uniform 404 JSON error for unmatched routes', async () => {
    const res = await request(app).get('/api/does-not-exist');
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });
});

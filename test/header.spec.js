const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const {JSDOM} = require('jsdom');

test('header and remittance bar render correctly', () => {
  const html = fs.readFileSync(path.join(__dirname, '..', '1.4.1 GUI Entry.html'), 'utf8');
  const dom = new JSDOM(html, { runScripts: 'dangerously', url: 'https://example.org' });
  const el = dom.window.buildIomStatementHtml({FINAL:0}, 'Jan', '2025-01-01');
  // Title should be set for export naming
  assert.equal(dom.window.document.title, 'IOM - HT Bill – Jan');

  const h2 = el.querySelector('.doc-header h2');
  assert.equal(h2.textContent.trim(), 'IOM - HT Bill');
  assert.equal(el.querySelector('.doc-header .company').textContent.trim(), 'GAIL (India) Limited – Samakhiali, Gujarat');
  assert.equal(el.querySelector('.doc-header .dept').textContent.trim(), 'Electrical Department');
  assert.equal(el.querySelector('.doc-header .mini').textContent.trim(), 'Billing Month: Jan');

  const metaBlock = el.querySelector('.doc-meta');
  const meta = metaBlock.textContent;
  assert.match(meta, /Generation Date:\s*2025-01-01/);
  assert.ok(!/Vendor Code:/i.test(meta), 'Header must not show Vendor Code');
  assert.ok(!/BankT:/i.test(meta), 'Header must not show BankT');
  const time = metaBlock.querySelector('time');
  assert.ok(time, 'Generation Date should use <time>');
  assert.ok(time.getAttribute('datetime'), 'time element requires datetime attribute');
  assert.match(time.getAttribute('datetime'), /^\d{4}-\d{2}-\d{2}T/, 'datetime should be ISO-8601-like (YYYY-MM-DDT...)');

  // Heading semantics for assistive tech
  assert.equal(h2.getAttribute('role'), 'heading', 'Title should expose role=heading');
  assert.equal(h2.getAttribute('aria-level'), '1', 'Title should expose aria-level=1');

  // Defensive: ensure old test IDs are not reintroduced in the header
  assert.ok(!el.querySelector('.doc-header [data-testid="sap-vendor-code"]'), 'sap-vendor-code test id must not appear in header');
  assert.ok(!el.querySelector('.doc-header [data-testid="sap-bankt"]'), 'sap-bankt test id must not appear in header');

  const bar = el.querySelector('.info-bar');
  assert.ok(bar);
  assert.equal(bar.querySelectorAll('b').length, 5);
  assert.match(bar.textContent, /Please pay to/);
  assert.match(bar.textContent, /Vendor Code:\s*ZG0435/);
  // Ensure NBSPs to keep payee on one line
  assert.match(bar.innerHTML, /Paschim&nbsp;Gujarat&nbsp;Vij&nbsp;Company&nbsp;Ltd/);
  // Full-text discoverability while truncated
  assert.ok(bar.getAttribute('title') && bar.getAttribute('title').trim().length > 0, 'info-bar should expose full text via title');
  assert.ok(bar.getAttribute('aria-label') && bar.getAttribute('aria-label').trim().length > 0, 'info-bar should expose full text via aria-label');

  // Decorative page number should be hidden from AT
  const pageNum = el.querySelector('.page-number');
  assert.ok(pageNum && pageNum.getAttribute('aria-hidden') === 'true', 'page number should be aria-hidden');

  // Quick guard that print CSS reserves footer space
  const cssSource = html.toString();
  assert.ok(cssSource.includes('padding:0 0 16mm 0'), 'Print padding for footer must exist');
});

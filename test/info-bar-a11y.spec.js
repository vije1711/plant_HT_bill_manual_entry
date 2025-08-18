const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

test('info bar exposes full text via title and aria-label', () => {
  const html = fs.readFileSync(path.join(__dirname, '..', '1.4.1 GUI Entry.html'), 'utf8');
  const dom = new JSDOM(html, { runScripts: 'dangerously', url: 'https://example.org' });
  const el = dom.window.buildIomStatementHtml({ FINAL: 0 }, 'Jan', '2025-01-01');
  const bar = el.querySelector('.info-bar');
  assert.ok(bar, 'info-bar must exist');
  const title = (bar.getAttribute('title') || '').trim();
  const aria = (bar.getAttribute('aria-label') || '').trim();
  assert.ok(title.length > 0, 'info-bar requires a non-empty title attribute');
  assert.ok(aria.length > 0, 'info-bar requires a non-empty aria-label attribute');
});


const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

test('signatures are English-only and exact', () => {
  const html = fs.readFileSync(path.join(__dirname, '..', '1.4.1 GUI Entry.html'), 'utf8');
  const dom = new JSDOM(html, { runScripts: 'dangerously', url: 'https://example.org' });
  const model = { C9:1,F16:2,G16:3,C24:4,A31:5,F9:6,FINAL:7 };
  const el = dom.window.buildIomStatementHtml(model, 'Jan', '2025-01-01');
  const sm = el.querySelector('[data-testid="sig-sm-ele"]').textContent.trim();
  const om = el.querySelector('[data-testid="sig-dgm-om"]').textContent.trim();
  const fa = el.querySelector('[data-testid="sig-dgm-fa"]').textContent.trim();
  assert.equal(sm, 'Senior Manager (ELE)');
  assert.equal(om, 'DGM (O&M)/WIC, Samakhiali');
  assert.equal(fa, 'DGM (F&A), Jaipur');
  const blockText = el.querySelector('.signatures').textContent;
  assert.ok(!/[\u0900-\u097F]/.test(blockText));
});

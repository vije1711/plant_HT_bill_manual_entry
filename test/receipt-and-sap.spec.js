const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

test('receipt note present and SAP constants immutable', () => {
  const html = fs.readFileSync(path.join(__dirname, '..', '1.4.1 GUI Entry.html'), 'utf8');
  const dom = new JSDOM(html, { runScripts: 'dangerously', url: 'https://example.org' });
  const model = { C9:1,F16:2,G16:3,C24:4,A31:5,F9:6,FINAL:7, vendorCode:'VCODE', bankT:'BANK1' };
  const el = dom.window.buildIomStatementHtml(model, 'Jan', '2025-01-01');
  const note = el.querySelector('[data-testid="receipt-note"]');
  assert.equal(note && note.textContent.trim(), 'Bill received via central post.');
  assert.match(el.querySelector('.info-bar').textContent, /Vendor Code:\s*ZG0435/);
});

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

test('info bar appears before the mapping section', () => {
  const html = fs.readFileSync(path.join(__dirname, '..', '1.4.1 GUI Entry.html'), 'utf8');
  const dom = new JSDOM(html, { runScripts: 'dangerously', url: 'https://example.org' });
  const sheet = dom.window.buildIomStatementHtml({ FINAL: 0 }, 'Jan', '2025-01-01');
  const bar = sheet.querySelector('.info-bar');
  const mapping = sheet.querySelector('.sec.mapping');
  assert.ok(bar, 'info-bar must exist');
  assert.ok(mapping, 'mapping section must exist');
  const kids = Array.from(sheet.children);
  const iBar = kids.indexOf(bar);
  const iMap = kids.indexOf(mapping);
  assert.ok(iBar > -1 && iMap > -1 && iBar < iMap, 'info-bar must precede the mapping section');
});

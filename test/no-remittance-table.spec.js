const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

test('remittance table is removed; info bar remains', () => {
  const html = fs.readFileSync(path.join(__dirname, '..', '1.4.1 GUI Entry.html'), 'utf8');
  const dom = new JSDOM(html, { runScripts: 'dangerously', url: 'https://example.org' });
  const el = dom.window.buildIomStatementHtml({ FINAL: 0 }, 'Jan', '2025-01-01');
  // Table and header absent
  assert.ok(
    !Array.from(el.querySelectorAll('h3')).some(h => /^\s*Remittance Details\s*$/i.test(h.textContent)),
    'Remittance Details header must be removed'
  );
  const clone = el.cloneNode(true);
  clone.querySelector('.info-bar')?.remove();
  assert.ok(
    !/Payee|Bank A\/C No\.|IFSC|Branch/.test(clone.textContent),
    'Remittance rows must be removed'
  );
  // Info bar still present
  const bar = el.querySelector('.info-bar');
  assert.ok(bar && /Please pay to/i.test(bar.textContent), 'info-bar should remain');
});

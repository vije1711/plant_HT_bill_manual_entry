const test = require('node:test');
const assert = require('node:assert/strict');
const {JSDOM} = require('jsdom');
const fs = require('node:fs');
const path = require('node:path');

test('arrear rows use G = D when PO rate not 1', async () => {
  let html = fs.readFileSync(path.join(__dirname, '..', '1.4.1 GUI Entry.html'), 'utf8');
  html = html.replace(/<script src="\.\/xlsx\.full\.min\.js"><\/script>/, '');

  const dom = new JSDOM(html, {
    runScripts: 'dangerously',
    resources: 'usable',
    url: 'https://example.org/'
  });

  await new Promise(resolve => {
    if (dom.window.document.readyState === 'complete') resolve();
    else dom.window.addEventListener('load', () => resolve());
  });

  const doc = dom.window.document;
  doc.getElementById('qty_ARREAR_FCA').value = '100';
  doc.getElementById('tar_ARREAR_FCA').value = '1';
  doc.getElementById('po_ARREAR_FCA').value = '2';

  dom.window.computeSes();

  const toNum = t => Number(t.replace(/[₹,]/g, ''));
  const d = toNum(doc.getElementById('d_ARREAR_FCA').textContent);
  const g = toNum(doc.getElementById('g_ARREAR_FCA').textContent);

  assert.equal(d, 100);
  assert.equal(g, 100);

  const badgeText = doc.getElementById('parityBadge').textContent;
  const delta = Number(badgeText.match(/Δ ₹([0-9.]+)/)[1]);
  assert.equal(delta, 0);
});

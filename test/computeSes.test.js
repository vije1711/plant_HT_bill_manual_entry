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
  // Neutralize unrelated MD slabs so ΣD = 100
  doc.getElementById('tar_MD_SLAB1').value = '0';
  doc.getElementById('tar_MD_SLAB2').value = '0';
  doc.getElementById('B4').value = '0';
  // Seed both A9 and B9 so C9 derives from A9+B9 = 100.00 (and override C9v to prove precedence)
  (doc.getElementById('A9v') || doc.body.appendChild(Object.assign(doc.createElement('div'),{id:'A9v'}))).textContent = '₹80.00';
  (doc.getElementById('B9v') || doc.body.appendChild(Object.assign(doc.createElement('div'),{id:'B9v'}))).textContent = '₹20.00';
  (doc.getElementById('C9v') || doc.body.appendChild(Object.assign(doc.createElement('div'),{id:'C9v'}))).textContent = '₹999.00'; // should be ignored when A9/B9 exist

  dom.window.computeSes();

  const toNum = t => Number(t.replace(/[₹,]/g, ''));
  const d = toNum(doc.getElementById('d_ARREAR_FCA').textContent);
  const g = toNum(doc.getElementById('g_ARREAR_FCA').textContent);

  assert.equal(d, 100);
  assert.equal(g, 100);

  const badgeText = doc.getElementById('parityBadge').textContent;
  const match = badgeText.match(/Δ ([^|]+) \| vs C9 ([^|]+)/);
  const delta = toNum(match[1]);
  const deltaC9 = toNum(match[2]);
  assert.equal(delta, 0);
  // C9 must be derived from A9+B9 = 100.00 → ΣD(=100) − C9(=100) = 0
  assert.equal(deltaC9, 0);

  // Now remove A9/B9 to verify fallback to C9v
  doc.getElementById('A9v').remove(); doc.getElementById('B9v').remove();
  dom.window.computeSes();
  const match2 = doc.getElementById('parityBadge').textContent.match(/vs C9 ([^|]+)/);
  const deltaC9_fallback = toNum(match2[1]); // ΣD(=100) − C9v(=999) = −899.00
  assert.ok(Math.abs(deltaC9_fallback + 899.00) <= 0.01);
});

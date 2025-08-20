const test = require('node:test');
const assert = require('node:assert/strict');
const {JSDOM} = require('jsdom');
const fs = require('node:fs');
const path = require('node:path');

test('reference bill calculations', async () => {
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
  const setVal = (id, value) => {
    const el = doc.getElementById(id);
    el.value = String(value);
    el.dataset.value = String(value);
  };
  assert.equal(Number(doc.getElementById('tar_TOD_NIGHT_REBATE').value), 1.5);
  assert.equal(Number(doc.getElementById('tar_PF_CHARGE_SLAB1').value), 2.35);
  setVal('A4', 1483313);
  setVal('B4', 880925);
  setVal('C4', 6229914.60);
  setVal('D4', 0);
  setVal('E4', 3487713.86);
  setVal('F4', 0);
  setVal('G4', 93448.72);
  setVal('H4', 418954.80);
  setVal('I4', 0);
  dom.window.compute();
  const toNum = t => Number(t.replace(/[^0-9.-]/g, ''));
  const qty = id => Number(doc.getElementById('qty_' + id).value);
  const tar = id => Number(doc.getElementById('tar_' + id).value);
  const amt = id => toNum(doc.getElementById('d_' + id).textContent);
  const close = (a, b) => assert.ok(Math.abs(a - b) <= 0.01, `${a} ≉ ${b}`);
  close(qty('MD_SLAB1'), 500);
  close(tar('MD_SLAB1'), 150);
  close(amt('MD_SLAB1'), 75000);
  close(qty('MD_SLAB2'), 500);
  close(tar('MD_SLAB2'), 260);
  close(amt('MD_SLAB2'), 130000);
  close(qty('MD_SLAB3'), 1423);
  close(tar('MD_SLAB3'), 475);
  close(amt('MD_SLAB3'), 675925);
  close(qty('EC_SLAB1'), 1483313);
  close(tar('EC_SLAB1'), 4.2);
  close(amt('EC_SLAB1'), 6229914.60);
  close(qty('TOD_PEAK'), 492888);
  close(tar('TOD_PEAK'), 0.85);
  close(amt('TOD_PEAK'), 418954.80);
  close(qty('TOD_NIGHT_REBATE'), -62299.15);
  close(tar('TOD_NIGHT_REBATE'), 1.5);
  close(amt('TOD_NIGHT_REBATE'), -93448.72);
  close(qty('PF_CHARGE_SLAB1'), -62299.15);
  close(tar('PF_CHARGE_SLAB1'), 2.35);
  close(amt('PF_CHARGE_SLAB1'), qty('PF_CHARGE_SLAB1') * 2.35);
  close(qty('ARREAR_ED'), 10924059.54);
  close(tar('ARREAR_ED'), 0.2);
  close(amt('ARREAR_ED'), 2184811.91);

  // Changing D4 should not affect TOD_NIGHT_REBATE
  setVal('D4', 5000);
  dom.window.compute();
  close(qty('TOD_NIGHT_REBATE'), -62299.15);
  close(amt('TOD_NIGHT_REBATE'), -93448.72);
  close(qty('PF_CHARGE_SLAB1'), -62299.15);
  close(amt('PF_CHARGE_SLAB1'), qty('PF_CHARGE_SLAB1') * 2.35);
  close(qty('ARREAR_ED'), 10929059.54);
  close(amt('ARREAR_ED'), 2185811.91);
});

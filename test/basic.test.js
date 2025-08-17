const test = require('node:test');
const assert = require('node:assert/strict');
const {JSDOM} = require('jsdom');
const fs = require('node:fs');
const path = require('node:path');

test('sample data calculations', async () => {
  let html = fs.readFileSync(path.join(__dirname, '..', '1.4.1 GUI Entry.html'), 'utf8');
  html = html.replace(/<script src="\.\/xlsx\.full\.min\.js"><\/script>/, '');

  const dom = new JSDOM(html, {
    runScripts: 'dangerously',
    resources: 'usable',
    url: 'https://example.org/'
  });

  await new Promise((resolve) => {
    if (dom.window.document.readyState === 'complete') resolve();
    else dom.window.addEventListener('load', () => resolve());
  });

  dom.window.fillSampleData();
  const model = dom.window.compute(true);

  assert.equal(model.A9, 14350);
  assert.equal(model.C9, 17220);
  assert.equal(Math.round(model.FINAL), 16700);

  assert.equal(typeof dom.window.pdfMake, 'undefined');
});

test('signatures and receipt note present', async () => {
  let html = fs.readFileSync(path.join(__dirname, '..', '1.4.1 GUI Entry.html'), 'utf8');
  html = html.replace(/<script src="\.\/xlsx\.full\.min\.js"><\/script>/, '');

  const dom = new JSDOM(html, {
    runScripts: 'dangerously',
    resources: 'usable',
    url: 'https://example.org/'
  });

  await new Promise((resolve) => {
    if (dom.window.document.readyState === 'complete') resolve();
    else dom.window.addEventListener('load', () => resolve());
  });

  const el = dom.window.buildIomStatementHtml({FINAL:7, C9:0, F16:0, G16:0, C24:0, A31:0, F9:0}, 'Jan', '2025-01-01');

  assert.equal(el.querySelector('[data-testid="sig-sm-ele"]').textContent.trim(), 'Senior Manager (ELE)');
  assert.equal(el.querySelector('[data-testid="sig-dgm-om"]').textContent.trim(), 'DGM (O&M)/WIC, Samakhiali');
  assert.equal(el.querySelector('[data-testid="sig-dgm-fa"]').textContent.trim(), 'DGM (F&A), Jaipur');

  const noteFound = Array.from(el.querySelectorAll('.footer-note')).some(n => n.textContent.includes('Bill received via central post.'));
  assert.ok(noteFound);
});

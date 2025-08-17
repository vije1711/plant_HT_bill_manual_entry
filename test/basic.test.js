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

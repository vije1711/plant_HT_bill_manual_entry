const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {JSDOM} = require('jsdom');

test('warn outline token exists and uses semi-transparent color', async () => {
  let html = fs.readFileSync(path.join(__dirname, '..', '1.4.1 GUI Entry.html'), 'utf8');
  html = html.replace(/<script src="\.\/xlsx\.full\.min\.js"><\/script>/, '');

  const dom = new JSDOM(html, {runScripts: 'dangerously', resources: 'usable', url: 'https://example.org/'});

  await new Promise((resolve) => {
    if (dom.window.document.readyState === 'complete') resolve();
    else dom.window.addEventListener('load', () => resolve());
  });

  const rootStyle = dom.window.getComputedStyle(dom.window.document.documentElement);
  const token = rootStyle.getPropertyValue('--warn-outline').trim();
  assert.ok(token, '--warn-outline token missing on :root');

  const m = token.match(/rgba\([^,]+,[^,]+,[^,]+,\s*([0-9.]+)\)/);
  assert.ok(m, '--warn-outline should be rgba');
  assert.ok(parseFloat(m[1]) < 1, '--warn-outline alpha should be < 1');

  const input = dom.window.document.querySelector('#receiptCard input');
  input.classList.add('warn');
  const outline = dom.window.getComputedStyle(input).getPropertyValue('outline');
  assert.match(outline, /var\(--warn-outline/, '#receiptCard input.warn should use --warn-outline');
  assert.match(
    outline,
    /var\(--warn-outline,\s*rgba\(255,120,120,.6\)\)/,
    '#receiptCard input.warn should provide rgba fallback with 60% alpha'
  );
});

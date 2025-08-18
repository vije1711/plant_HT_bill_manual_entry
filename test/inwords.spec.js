const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

function loadDom(){
  const html = fs.readFileSync(path.join(__dirname, '..', '1.4.1 GUI Entry.html'), 'utf8');
  return new JSDOM(html, { runScripts: 'dangerously', url: 'https://example.org' });
}

test('inWords converts numbers to Indian currency words', () => {
  const dom = loadDom();
  const { inWords } = dom.window;
  assert.equal(inWords(0), 'Zero');
  assert.equal(inWords(1), 'One');
  assert.equal(inWords(15), 'Fifteen');
  assert.equal(inWords(105), 'One Hundred Five');
  assert.equal(inWords(12345678), 'One Crore Twenty Three Lakh Forty Five Thousand Six Hundred Seventy Eight');
  assert.equal(inWords(1.5), 'Two');
});

test('buildSapLongText uses inWords for final amount', () => {
  const dom = loadDom();
  const { buildSapLongText } = dom.window;
  const model = {F16:0,G16:0,D24:0,E24:0,F24:0,F9:0,E9:0,D9:0,A24:0,B24:0,C24:0,A26:0,C9:0,FINAL:123.4};
  const txt = buildSapLongText(model, '2025-05');
  const lastLine = txt.trim().split('\n').pop();
  assert.equal(lastLine, 'Rupees One Hundred Twenty Three Only');
});

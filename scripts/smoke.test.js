const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const { JSDOM } = require('jsdom');

test('SAP identifiers are hard-coded and ignore model overrides', () => {
  const html = fs.readFileSync('1.4.1 GUI Entry.html', 'utf8');
  const dom = new JSDOM(html, { runScripts: 'dangerously', url: 'https://example.org' });
  const { window } = dom;

  const withOverrides = { C9:1,F16:2,G16:3,C24:4,A31:5,F9:6,FINAL:7, vendorCode:'VCODE', bankT:'BANK1' };
  const el1 = window.buildIomStatementHtml(withOverrides, 'Jan', '2024-04-01');
  assert.equal(el1.querySelector('[data-testid="sap-vendor-code"]').textContent, 'ZG0435');
  assert.equal(el1.querySelector('[data-testid="sap-bankt"]').textContent, 'SBI1');

  const withoutOverrides = { C9:1,F16:2,G16:3,C24:4,A31:5,F9:6,FINAL:7 };
  const el2 = window.buildIomStatementHtml(withoutOverrides, 'Jan', '2024-04-01');
  assert.equal(el2.querySelector('[data-testid="sap-vendor-code"]').textContent, 'ZG0435');
  assert.equal(el2.querySelector('[data-testid="sap-bankt"]').textContent, 'SBI1');
});

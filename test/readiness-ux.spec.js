const test = require('node:test');
const assert = require('node:assert/strict');
const { JSDOM } = require('jsdom');
const fs = require('node:fs');
const path = require('node:path');

async function bootDom() {
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
  if (typeof dom.window.HTMLElement.prototype.scrollIntoView !== 'function') {
    dom.window.HTMLElement.prototype.scrollIntoView = () => {};
  }
  return dom;
}

test('IOM action gating follows base readiness', async () => {
  const dom = await bootDom();
  const doc = dom.window.document;
  const dueDate = doc.getElementById('dueDate');
  const render = doc.getElementById('renderHtml');
  const save = doc.getElementById('saveHtmlPdf');
  const open = doc.getElementById('openHtmlPdf');

  dueDate.value = '';
  dom.window.compute();
  assert.equal(render.disabled, true, 'Render should be disabled when due date is missing');

  dueDate.value = '2026-03-20';
  dom.window.compute();
  assert.equal(render.disabled, false, 'Render should be enabled when base readiness is met');
  assert.equal(save.disabled, true, 'Save should remain disabled until preview exists');
  assert.equal(open.disabled, true, 'Open should remain disabled until preview exists');
});

test('print actions are disabled when preview becomes stale after edits', async () => {
  const dom = await bootDom();
  const doc = dom.window.document;

  doc.getElementById('dueDate').value = '2026-03-20';
  doc.getElementById('B4').value = '1000';
  doc.getElementById('B4').dataset.value = '1000';

  const model = dom.window.compute(true);
  assert.ok(model, 'Strict model should be available before rendering');
  dom.window.renderHtmlPreview(model, '2026-03', '2026-03-01');
  dom.window.updateIomUxState();

  const save = doc.getElementById('saveHtmlPdf');
  const open = doc.getElementById('openHtmlPdf');
  assert.equal(save.disabled, false, 'Save should be enabled right after fresh render');
  assert.equal(open.disabled, false, 'Open should be enabled right after fresh render');

  doc.getElementById('B4').value = '2000';
  doc.getElementById('B4').dataset.value = '2000';
  dom.window.disablePrintActions();
  dom.window.compute();

  assert.equal(save.disabled, true, 'Save should be disabled after inputs change');
  assert.equal(open.disabled, true, 'Open should be disabled after inputs change');
});

test('due-date risk classification returns expected states', async () => {
  const dom = await bootDom();
  const risk = dom.window.getDueDateRiskState;
  assert.equal(typeof risk, 'function');

  assert.equal(risk('', new Date('2026-03-10T09:00:00')), 'none');
  assert.equal(risk('2026-03-11', new Date('2026-03-10T09:00:00')), 'high-risk');
  assert.equal(risk('2026-03-10', new Date('2026-03-10T15:59:00')), 'today');
  assert.equal(risk('2026-03-10', new Date('2026-03-10T16:00:00')), 'overdue');
  assert.equal(risk('2026-03-15', new Date('2026-03-10T09:00:00')), 'safe');
});

test('due-date quick actions support previous working day and clear', async () => {
  const dom = await bootDom();
  const doc = dom.window.document;
  const dueDate = doc.getElementById('dueDate');

  dueDate.value = '2026-03-09'; // Monday
  doc.getElementById('dueDatePrevWorkingDay').click();
  assert.equal(dueDate.value, '2026-03-06', 'Previous working day from Monday should be Friday');

  doc.getElementById('dueDateClear').click();
  assert.equal(dueDate.value, '', 'Clear should remove due date');
});

test('readiness popover lists go-fix actions and focuses target field', async () => {
  const dom = await bootDom();
  const doc = dom.window.document;

  const dueDate = doc.getElementById('dueDate');
  dueDate.value = '';
  dom.window.compute();
  dom.window.updateIomUxState();

  const issueBtn = doc.querySelector('#readinessIssueList button[data-target="dueDate"]');
  assert.ok(issueBtn, 'Due date issue should appear in readiness issue list');

  const details = doc.getElementById('financeReadinessDetails');
  details.setAttribute('open', 'open');
  issueBtn.click();

  assert.equal(doc.activeElement && doc.activeElement.id, 'dueDate', 'Clicking go-fix should focus due date field');
  assert.equal(details.hasAttribute('open'), false, 'Clicking go-fix should close readiness popover');
});

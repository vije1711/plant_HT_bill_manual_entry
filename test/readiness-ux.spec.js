const test = require('node:test');
const assert = require('node:assert/strict');
const { JSDOM } = require('jsdom');
const fs = require('node:fs');
const path = require('node:path');
const htmlSource = fs.readFileSync(path.join(__dirname, '..', '1.4.1 GUI Entry.html'), 'utf8');

async function bootDom() {
  let html = htmlSource;
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
  if (typeof dom.window.requestAnimationFrame !== 'function') {
    dom.window.requestAnimationFrame = (cb) => dom.window.setTimeout(cb, 0);
  }
  return dom;
}

async function flushFrames(win, count = 1) {
  for (let i = 0; i < count; i += 1) {
    await new Promise((resolve) => win.requestAnimationFrame(resolve));
  }
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

test('due-date field no longer renders quick-action controls', async () => {
  const dom = await bootDom();
  const doc = dom.window.document;

  assert.equal(doc.querySelector('.due-date-actions'), null, 'Due Date field should not render the removed quick-action group');
  assert.equal(doc.getElementById('dueDateToday'), null, 'Today quick action should be removed');
  assert.equal(doc.getElementById('dueDatePlus7'), null, '+7 Days quick action should be removed');
  assert.equal(doc.getElementById('dueDateMonthEnd'), null, 'Month End quick action should be removed');
  assert.equal(doc.getElementById('dueDatePrevWorkingDay'), null, 'Previous Working Day quick action should be removed');
  assert.equal(doc.getElementById('dueDateClear'), null, 'Clear quick action should be removed');
});

test('restore migrates legacy rc_dueDate to dueDate when dueDate key is missing', async () => {
  const dom = await bootDom();
  const doc = dom.window.document;
  const dueDate = doc.getElementById('dueDate');

  dueDate.value = '';
  dom.window.localStorage.setItem('weg-billing-v1', JSON.stringify({
    inputs: { rc_dueDate: '15-03-2026' },
    sheets: []
  }));

  const restored = dom.window.restore();
  assert.equal(restored, true, 'Restore should report success for legacy payload');
  assert.equal(dueDate.value, '2026-03-15', 'Legacy rc_dueDate should migrate to dueDate in ISO format');
});

test('dueDate text fallback is excluded from INR masking during restore', async () => {
  const dom = await bootDom();
  const doc = dom.window.document;
  const dueDate = doc.getElementById('dueDate');

  dueDate.type = 'text';
  dueDate.value = '';
  dom.window.localStorage.setItem('weg-billing-v1', JSON.stringify({
    inputs: { dueDate: '2026-03-20' },
    sheets: []
  }));

  const restored = dom.window.restore();
  assert.equal(restored, true, 'Restore should report success');
  assert.equal(dom.window.shouldApplyInrMask(dueDate), false, 'dueDate should never be treated as INR-masked text input');
  assert.equal(dueDate.value, '2026-03-20', 'dueDate value should remain ISO text (not INR-formatted)');
});

test('due date row uses a compact visible risk badge and removes extra preview rows', async () => {
  const dom = await bootDom();
  const doc = dom.window.document;
  const label = doc.querySelector('label[for="dueDate"]');
  const dueDate = doc.getElementById('dueDate');
  const chip = doc.getElementById('dueDateRiskChip');
  const text = chip && chip.querySelector('.due-date-risk-text');
  const assistive = doc.getElementById('dueDateRiskAssistive');

  assert.ok(label, 'Due Date label should exist');
  assert.equal(label.textContent.includes('DUE'), false, 'Due Date label should no longer show the old DUE badge');
  assert.ok(chip, 'Due Date row should include the inline risk badge');
  assert.ok(text, 'Due Date risk badge should expose visible text state');
  assert.equal(text.textContent, 'NONE', 'Due Date risk badge should show the default visible state');
  assert.equal(doc.getElementById('dueDatePreview'), null, 'Due Date preview row should be removed');
  assert.ok(assistive, 'Due Date should expose assistive risk text');
  assert.match(dueDate.getAttribute('aria-describedby') || '', /\bdueDateRiskAssistive\b/, 'Due Date input should reference assistive risk text');
  assert.equal(assistive.getAttribute('role'), 'status', 'Due Date assistive text should be exposed as a polite status region');
  assert.equal(assistive.getAttribute('aria-live'), 'polite', 'Due Date assistive text should announce updates politely');
});

test('due-date risk badge updates visible text, tooltip, and assistive text', async () => {
  const dom = await bootDom();
  const doc = dom.window.document;
  const chip = doc.getElementById('dueDateRiskChip');
  const text = chip.querySelector('.due-date-risk-text');
  const assistive = doc.getElementById('dueDateRiskAssistive');

  dom.window.updateDueDatePreview('');
  assert.equal(chip.dataset.state, 'none', 'Empty due date should use the none risk state');
  assert.equal(text.textContent, 'NONE', 'Empty due date should expose the default visible risk text');
  assert.equal(chip.title, 'Payment risk: Not set', 'Empty due date should expose a not-set tooltip');
  assert.equal(assistive.textContent, 'Payment risk: Not set', 'Empty due date should expose not-set assistive text');

  dom.window.getDueDateRiskState = () => 'high-risk';
  dom.window.updateDueDatePreview('2026-03-10');
  assert.equal(chip.dataset.state, 'high-risk', 'Risk icon should reflect the updated due-date risk state');
  assert.equal(text.textContent, 'RISK', 'High-risk due date should expose visible risk text without hover');
  assert.equal(chip.title, 'Payment risk: High risk', 'Risk icon should expose the updated tooltip text');
  assert.equal(assistive.textContent, 'Payment risk: High risk', 'Risk icon should expose the updated assistive text');
});

test('due-date assistive status only rewrites when the announced risk changes', async () => {
  const dom = await bootDom();
  const doc = dom.window.document;
  const assistive = doc.getElementById('dueDateRiskAssistive');
  let writes = 0;
  let value = 'Payment risk: High risk';

  Object.defineProperty(assistive, 'textContent', {
    configurable: true,
    get() {
      return value;
    },
    set(next) {
      writes += 1;
      value = String(next);
    }
  });

  dom.window.getDueDateRiskState = () => 'high-risk';
  dom.window.updateDueDatePreview('2026-03-10');
  assert.equal(writes, 0, 'Same risk text should not rewrite the live region during unrelated recomputes');

  dom.window.getDueDateRiskState = () => 'overdue';
  dom.window.updateDueDatePreview('2026-03-10');
  assert.equal(writes, 1, 'Changed risk text should update the live region once');
  assert.equal(value, 'Payment risk: Overdue', 'Changed risk text should update to the new announcement');
});

test('forced-colors due-date badge override matches stateful badges at equal specificity', () => {
  assert.match(
    htmlSource,
    /@media\s*\(forced-colors:\s*active\)\s*\{[\s\S]*?\.due-date-field\s+\.due-date-risk-badge,\s*[\s\S]*?\.due-date-field\s+\.due-date-risk-badge\[data-state\]/,
    'Forced-colors block should target stateful due-date badges so it can override the state-specific palette'
  );
});

test('toolbar shows consolidated workbook, make iom, configuration, and more menus', async () => {
  const dom = await bootDom();
  const doc = dom.window.document;

  assert.ok(doc.getElementById('billMonth'), 'Billing Month input should remain visible');
  assert.match(doc.querySelector('#sheetsMenu > summary').textContent, /Workbook/, 'Sheets menu should be relabeled as Workbook');
  assert.ok(doc.getElementById('iomMenu'), 'Make IOM menu should remain present');
  assert.ok(doc.getElementById('configMenu'), 'Configuration should be restored as a top-level menu');
  assert.match(doc.querySelector('#configMenu > summary').textContent, /Configuration/, 'Configuration should have a visible toolbar summary');
  assert.ok(doc.getElementById('moreMenu'), 'More menu should exist');
  assert.equal(doc.getElementById('themeMenu'), null, 'Theme should no longer be a top-level menu');
  assert.equal(doc.querySelector('.toolbar [aria-label="Utilities"]'), null, 'Utilities should no longer be top-level');
  assert.equal(doc.querySelector('.toolbar [aria-label="Analysis"]'), null, 'Analysis should no longer be top-level');
  assert.equal(doc.getElementById('openConfigMenu'), null, 'More should no longer contain a configuration launcher');
});

test('workbook menu includes sheet, workbook, and analysis actions', async () => {
  const dom = await bootDom();
  const doc = dom.window.document;
  const workbookPanel = doc.querySelector('#sheetsMenu .workbook-panel');

  assert.ok(workbookPanel, 'Workbook panel should exist');
  assert.ok(workbookPanel.contains(doc.getElementById('sheetSearch')), 'Workbook should include sheet search');
  assert.ok(workbookPanel.contains(doc.getElementById('clearSheets')), 'Workbook should include Clear Sheets');
  assert.ok(workbookPanel.contains(doc.getElementById('analyzeWorkbook')), 'Workbook should include Build Monthly Trends');
  assert.ok(workbookPanel.contains(doc.getElementById('exportAnalysisCsv')), 'Workbook should include Export Analysis CSV');
});

test('sheet search arrow-down moves focus into filtered sheet results', async () => {
  const dom = await bootDom();
  const doc = dom.window.document;
  const sheetsMenu = doc.getElementById('sheetsMenu');
  const sheetSearch = doc.getElementById('sheetSearch');

  dom.window.XLSX = {
    utils: {
      book_new: () => ({
        Props: {},
        SheetNames: ['2026-03', '2026-04'],
        Sheets: { '2026-03': {}, '2026-04': {} }
      })
    }
  };

  sheetsMenu.setAttribute('open', 'open');
  sheetsMenu.dispatchEvent(new dom.window.Event('toggle'));
  await flushFrames(dom.window, 2);

  sheetSearch.value = '2026';
  sheetSearch.dispatchEvent(new dom.window.Event('input', { bubbles: true }));
  sheetSearch.focus();
  sheetSearch.dispatchEvent(new dom.window.KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));

  const firstSheetRow = doc.querySelector('#sheetMenuList [role="menuitem"]');
  assert.ok(firstSheetRow, 'Filtered sheet results should exist');
  assert.equal(doc.activeElement, firstSheetRow, 'ArrowDown from sheet search should focus the first filtered sheet row');
});

test('sheet search arrow-up reaches the preceding workbook action', async () => {
  const dom = await bootDom();
  const doc = dom.window.document;
  const sheetsMenu = doc.getElementById('sheetsMenu');
  const sheetSearch = doc.getElementById('sheetSearch');
  const downloadBtn = doc.getElementById('downloadExcel');

  dom.window.XLSX = {
    utils: {
      book_new: () => ({
        Props: {},
        SheetNames: ['2026-03', '2026-04'],
        Sheets: { '2026-03': {}, '2026-04': {} }
      })
    }
  };

  sheetsMenu.setAttribute('open', 'open');
  sheetsMenu.dispatchEvent(new dom.window.Event('toggle'));
  await flushFrames(dom.window, 2);

  sheetSearch.focus();
  sheetSearch.dispatchEvent(new dom.window.KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }));

  assert.equal(doc.activeElement, downloadBtn, 'ArrowUp from sheet search should move to the preceding workbook action');
});

test('sheet search arrow navigation still reaches workbook actions when there are no visible sheet rows', async () => {
  const dom = await bootDom();
  const doc = dom.window.document;
  const sheetsMenu = doc.getElementById('sheetsMenu');
  const sheetSearch = doc.getElementById('sheetSearch');
  const downloadBtn = doc.getElementById('downloadExcel');
  const analyzeBtn = doc.getElementById('analyzeWorkbook');

  dom.window.XLSX = {
    utils: {
      book_new: () => ({
        Props: {},
        SheetNames: ['2026-03', '2026-04'],
        Sheets: { '2026-03': {}, '2026-04': {} }
      })
    }
  };

  sheetsMenu.setAttribute('open', 'open');
  sheetsMenu.dispatchEvent(new dom.window.Event('toggle'));
  await flushFrames(dom.window, 2);

  sheetSearch.value = 'no-match';
  sheetSearch.dispatchEvent(new dom.window.Event('input', { bubbles: true }));
  sheetSearch.focus();
  sheetSearch.dispatchEvent(new dom.window.KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
  assert.equal(doc.activeElement, analyzeBtn, 'ArrowDown should move to the next workbook action when no sheet rows are visible');

  sheetSearch.focus();
  sheetSearch.dispatchEvent(new dom.window.KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }));
  assert.equal(doc.activeElement, downloadBtn, 'ArrowUp should move to the preceding workbook action when no sheet rows are visible');
});

test('auto-update download refreshes the open workbook browser immediately', async () => {
  const dom = await bootDom();
  const doc = dom.window.document;
  const workbook = {
    Props: {},
    SheetNames: ['2026-04'],
    Sheets: { '2026-04': {} }
  };

  dom.window.XLSX = {
    utils: {
      book_new: () => workbook
    },
    writeFile: () => {}
  };
  dom.window.compute = () => ({ FINAL: 0, creditsExtras: [], debitExtras: [], finalExtras: [] });
  dom.window.buildSheetData = () => ({ stub: true });

  doc.getElementById('billMonth').value = '2026-05';
  doc.getElementById('dueDate').value = '2026-05-20';

  const sheetsMenu = doc.getElementById('sheetsMenu');
  const summary = sheetsMenu.querySelector('summary');
  const panel = sheetsMenu.querySelector('.menu-panel');
  let rectCalls = 0;
  sheetsMenu.setAttribute('open', 'open');
  sheetsMenu.dispatchEvent(new dom.window.Event('toggle'));
  await flushFrames(dom.window, 2);

  Object.defineProperty(dom.window, 'innerHeight', {
    configurable: true,
    writable: true,
    value: 160
  });
  summary.getBoundingClientRect = () => ({ bottom: 42 });
  panel.getBoundingClientRect = () => {
    rectCalls += 1;
    return { left: 20, right: 260, bottom: 220 };
  };

  doc.getElementById('downloadExcel').click();
  await new Promise((resolve) => dom.window.setTimeout(resolve, 0));
  await flushFrames(dom.window, 2);

  const visibleSheetRows = Array.from(doc.querySelectorAll('#sheetMenuList [role="menuitem"]')).map(el => el.dataset.name || el.textContent.trim());
  assert.ok(visibleSheetRows.includes('2026-05'), 'Auto-update download should immediately refresh the open Browse sheets list with the new month');
  assert.ok(rectCalls >= 1, 'Auto-update download should recompute Workbook placement after refreshing the visible sheet browser');
  assert.equal(panel.classList.contains('drop-up'), false, 'Workbook should stay below the sticky header instead of flipping upward after auto-refresh');
  assert.ok(panel.style.maxHeight.includes('110px'), 'Workbook should still clamp to the available space below the toolbar after auto-refresh');
  assert.notEqual(panel.style.maxHeight, '110px', 'Workbook should preserve its CSS max-height cap instead of replacing it with a raw inline height');
});

test('workbook menu recomputes placement after sheet results populate on open', async () => {
  const dom = await bootDom();
  const doc = dom.window.document;
  const sheetsMenu = doc.getElementById('sheetsMenu');
  const summary = sheetsMenu.querySelector('summary');
  const panel = sheetsMenu.querySelector('.menu-panel');
  let rectCalls = 0;

  dom.window.XLSX = {
    utils: {
      book_new: () => ({
        Props: {},
        SheetNames: ['2026-01', '2026-02', '2026-03', '2026-04', '2026-05', '2026-06'],
        Sheets: {
          '2026-01': {},
          '2026-02': {},
          '2026-03': {},
          '2026-04': {},
          '2026-05': {},
          '2026-06': {}
        }
      })
    }
  };

  Object.defineProperty(dom.window, 'innerHeight', {
    configurable: true,
    writable: true,
    value: 160
  });
  summary.getBoundingClientRect = () => ({ bottom: 42 });
  panel.getBoundingClientRect = () => {
    rectCalls += 1;
    return { left: 20, right: 260, bottom: rectCalls === 1 ? 120 : 220 };
  };

  sheetsMenu.setAttribute('open', 'open');
  sheetsMenu.dispatchEvent(new dom.window.Event('toggle'));
  await flushFrames(dom.window, 2);

  assert.ok(rectCalls >= 2, 'Opening Workbook should recompute placement after sheet rows populate');
  assert.equal(panel.classList.contains('drop-up'), false, 'Workbook should stay below the sticky header after populated content overflows the viewport');
  assert.ok(panel.style.maxHeight.includes('110px'), 'Workbook should still clamp to the available space below the toolbar when the sheet list grows');
  assert.notEqual(panel.style.maxHeight, '110px', 'Workbook should preserve its CSS max-height cap when the sheet list grows');
});

test('workbook menu uses the space above when the trigger sits near the bottom of a short viewport', async () => {
  const dom = await bootDom();
  const doc = dom.window.document;
  const sheetsMenu = doc.getElementById('sheetsMenu');
  const summary = sheetsMenu.querySelector('summary');
  const panel = sheetsMenu.querySelector('.menu-panel');

  Object.defineProperty(dom.window, 'innerHeight', {
    configurable: true,
    writable: true,
    value: 160
  });
  summary.getBoundingClientRect = () => ({ top: 132, bottom: 150 });
  panel.getBoundingClientRect = () => ({ left: 20, right: 260, bottom: 140 });

  sheetsMenu.setAttribute('open', 'open');
  sheetsMenu.dispatchEvent(new dom.window.Event('toggle'));
  await flushFrames(dom.window, 2);

  assert.equal(panel.classList.contains('drop-up'), true, 'Workbook should open upward when there is almost no usable space below the wrapped toolbar');
  assert.ok(panel.style.maxHeight.includes('124px'), 'Workbook should clamp against the larger space above when it opens upward');
  assert.notEqual(panel.style.maxHeight, '124px', 'Workbook should still preserve its CSS max-height cap when it opens upward');
});

test('dropdown arrangement prioritizes actions and isolates destructive actions', async () => {
  const dom = await bootDom();
  const doc = dom.window.document;

  const workbookTitles = Array.from(doc.querySelectorAll('#sheetsMenu .menu-section-title')).map(el => el.textContent.trim());
  assert.deepEqual(workbookTitles, ['Workbook actions', 'Browse sheets', 'Analysis', 'Danger zone'], 'Workbook menu should prioritize actions and isolate Clear Sheets');
  assert.match(doc.getElementById('clearSheets').className, /danger-action/, 'Clear Sheets should use danger styling');

  const iomTitles = Array.from(doc.querySelectorAll('#iomMenuPanel .menu-section-title')).map(el => el.textContent.trim());
  assert.deepEqual(iomTitles, ['Actions', 'Print preference'], 'Make IOM should separate actions from print preference');
  assert.equal(doc.getElementById('renderHtml').classList.contains('ghost'), false, 'Render IOM should remain visually primary');

  const moreTitles = Array.from(doc.querySelectorAll('#moreMenu .menu-section-title')).map(el => el.textContent.trim());
  assert.deepEqual(moreTitles, ['Theme', 'Utilities', 'Danger zone'], 'More should keep Reset separated in a danger zone');
  assert.match(doc.getElementById('resetAll').className, /danger-action/, 'Reset should use danger styling');
});

test('configuration menu splits rendered, vendor, bank, and approvals into separate groups', async () => {
  const dom = await bootDom();
  const doc = dom.window.document;
  const configTitles = Array.from(doc.querySelectorAll('#configMenu .config-group h3')).map(el => el.textContent.trim());

  assert.deepEqual(
    configTitles,
    ['A. Shares', 'B. Central Dak', 'C. Rendered details', 'D. Vendor display', 'E. Bank details', 'F. Approvals'],
    'Configuration should split the previous large rendered block into smaller, scannable groups'
  );
});

test('more menu theme selection updates status and closes menu', async () => {
  const dom = await bootDom();
  const doc = dom.window.document;
  const moreMenu = doc.getElementById('moreMenu');
  const status = doc.getElementById('themeMenuStatus');

  moreMenu.setAttribute('open', 'open');
  doc.getElementById('themeClassic').click();

  assert.equal(doc.documentElement.getAttribute('data-theme'), 'classic', 'Theme selection should update the root theme');
  assert.equal(status.textContent.trim(), 'Classic Neon', 'More menu should show the active theme label');
  assert.equal(moreMenu.hasAttribute('open'), false, 'Selecting a theme should close More');
});

test('more menu theme grid follows visual arrow-key navigation', async () => {
  const dom = await bootDom();
  const doc = dom.window.document;
  const moreMenu = doc.getElementById('moreMenu');
  const classic = doc.getElementById('themeClassic');
  const industrial = doc.getElementById('themeIndustrial');
  const military = doc.getElementById('themeMilitary');
  const executive = doc.getElementById('themeExecutive');
  const hazard = doc.getElementById('themeHazard');
  const sampleData = doc.getElementById('resetSample');

  moreMenu.setAttribute('open', 'open');
  moreMenu.dispatchEvent(new dom.window.Event('toggle'));
  await flushFrames(dom.window, 1);

  classic.focus();
  classic.dispatchEvent(new dom.window.KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
  assert.equal(doc.activeElement, industrial, 'ArrowRight should move across the visible theme grid row');

  classic.focus();
  classic.dispatchEvent(new dom.window.KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
  assert.equal(doc.activeElement, military, 'ArrowDown should move to the theme directly below in the visible grid');

  industrial.focus();
  industrial.dispatchEvent(new dom.window.KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
  assert.equal(doc.activeElement, classic, 'ArrowLeft should move back across the visible theme grid row');

  executive.focus();
  executive.dispatchEvent(new dom.window.KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
  assert.equal(doc.activeElement, sampleData, 'ArrowDown from the bottom grid row should move into the next More menu section');

  hazard.focus();
  hazard.dispatchEvent(new dom.window.KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
  assert.equal(doc.activeElement, sampleData, 'ArrowDown from the last theme option should also leave the grid for the next menu item');
});

test('configuration opens as a standalone menu and returns focus to its own summary on close', async () => {
  const dom = await bootDom();
  const doc = dom.window.document;
  const configMenu = doc.getElementById('configMenu');
  const configSummary = doc.getElementById('configMenuSummary');
  const moreMenu = doc.getElementById('moreMenu');

  assert.equal(configMenu.parentElement.classList.contains('menu'), true, 'Configuration should be restored as a top-level toolbar menu');
  assert.equal(doc.getElementById('openConfigMenu'), null, 'Configuration should no longer be launched from More');

  configMenu.setAttribute('open', 'open');
  configMenu.dispatchEvent(new dom.window.Event('toggle'));
  await flushFrames(dom.window, 4);

  assert.equal(configMenu.hasAttribute('open'), true, 'Configuration should open from the top toolbar');
  assert.equal(doc.activeElement && doc.activeElement.id, 'config_share_bitlavadia_pct', 'Configuration should focus the first field when opened');

  moreMenu.setAttribute('open', 'open');
  moreMenu.dispatchEvent(new dom.window.Event('toggle'));
  await flushFrames(dom.window, 2);

  assert.equal(configMenu.hasAttribute('open'), false, 'Opening More should close Configuration');

  configMenu.setAttribute('open', 'open');
  configMenu.dispatchEvent(new dom.window.Event('toggle'));
  await flushFrames(dom.window, 2);
  configMenu.removeAttribute('open');
  await flushFrames(dom.window, 2);

  assert.equal(doc.activeElement, configSummary, 'Closing configuration should return focus to Configuration summary');
});

test('document escape closes configuration even after focus leaves the panel', async () => {
  const dom = await bootDom();
  const doc = dom.window.document;
  const configMenu = doc.getElementById('configMenu');
  const configSummary = doc.getElementById('configMenuSummary');
  const billMonth = doc.getElementById('billMonth');

  configMenu.setAttribute('open', 'open');
  configMenu.dispatchEvent(new dom.window.Event('toggle'));
  await flushFrames(dom.window, 2);

  billMonth.focus();
  doc.dispatchEvent(new dom.window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
  await flushFrames(dom.window, 2);

  assert.equal(configMenu.hasAttribute('open'), false, 'Escape should close Configuration even when focus moved back into the page');
  assert.equal(doc.activeElement, configSummary, 'Closing Configuration via document Escape should restore focus to the summary');
});

test('outside click on non-focusable page chrome closes configuration and restores focus', async () => {
  const dom = await bootDom();
  const doc = dom.window.document;
  const configMenu = doc.getElementById('configMenu');
  const configSummary = doc.getElementById('configMenuSummary');

  configMenu.setAttribute('open', 'open');
  configMenu.dispatchEvent(new dom.window.Event('toggle'));
  await flushFrames(dom.window, 2);

  assert.equal(doc.activeElement && doc.activeElement.id, 'config_share_bitlavadia_pct', 'Configuration should start with focus inside the panel');

  doc.body.tabIndex = -1;
  doc.body.focus();
  doc.body.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true }));
  await flushFrames(dom.window, 2);

  assert.equal(configMenu.hasAttribute('open'), false, 'Outside click should close Configuration');
  assert.equal(doc.activeElement, configSummary, 'Outside click on non-focusable chrome should restore focus to Configuration summary');
});

test('config file input click does not auto-close configuration', async () => {
  const dom = await bootDom();
  const doc = dom.window.document;
  const configMenu = doc.getElementById('configMenu');
  const fileInput = doc.getElementById('configFileInput');

  configMenu.setAttribute('open', 'open');
  configMenu.dispatchEvent(new dom.window.Event('toggle'));
  await flushFrames(dom.window, 2);

  fileInput.click();
  await flushFrames(dom.window, 2);

  assert.equal(configMenu.hasAttribute('open'), true, 'Synthetic config file input clicks should not dismiss Configuration');
});

test('iom menu refreshes inline readiness state when opened', async () => {
  const dom = await bootDom();
  const doc = dom.window.document;
  const iomMenu = doc.getElementById('iomMenu');
  const badge = doc.getElementById('financeReadinessBadge');
  const state = doc.getElementById('financeReadinessState');

  doc.getElementById('dueDate').value = '';
  dom.window.compute();
  badge.dataset.state = 'ready';
  state.textContent = 'Ready';

  iomMenu.setAttribute('open', 'open');
  iomMenu.dispatchEvent(new dom.window.Event('toggle'));

  assert.equal(state.textContent, 'Blocked', 'Opening Make IOM should refresh readiness label');
  assert.equal(badge.dataset.state, 'blocked', 'Opening Make IOM should refresh readiness badge state');
  assert.equal(doc.activeElement && doc.activeElement.dataset && doc.activeElement.dataset.target, 'dueDate', 'Opening Make IOM should keep focus on the refreshed go-fix action');
});

test('iom menu recomputes placement after readiness refresh changes panel height', async () => {
  const dom = await bootDom();
  const doc = dom.window.document;
  const iomMenu = doc.getElementById('iomMenu');
  const summary = iomMenu.querySelector('summary');
  const panel = doc.getElementById('iomMenuPanel');
  let rectCalls = 0;

  Object.defineProperty(dom.window, 'innerHeight', {
    configurable: true,
    writable: true,
    value: 160
  });
  summary.getBoundingClientRect = () => ({ bottom: 42 });
  panel.getBoundingClientRect = () => {
    rectCalls += 1;
    return { left: 20, right: 260, bottom: rectCalls === 1 ? 120 : 220 };
  };

  doc.getElementById('dueDate').value = '';
  dom.window.compute();
  iomMenu.setAttribute('open', 'open');
  iomMenu.dispatchEvent(new dom.window.Event('toggle'));

  assert.ok(rectCalls >= 2, 'Opening Make IOM should recompute panel placement after readiness refresh');
  assert.equal(panel.classList.contains('drop-up'), false, 'Make IOM should stay below the sticky header after refreshed content overflows the viewport');
  assert.ok(panel.style.maxHeight.includes('110px'), 'Make IOM should still clamp to the available space below the toolbar when readiness content grows');
  assert.notEqual(panel.style.maxHeight, '110px', 'Make IOM should preserve its CSS max-height cap when readiness content grows');
});

test('more menu clamps horizontally when it would overflow the viewport', async () => {
  const dom = await bootDom();
  const doc = dom.window.document;
  const moreMenu = doc.getElementById('moreMenu');
  const panel = moreMenu.querySelector('.menu-panel');

  Object.defineProperty(dom.window, 'innerWidth', {
    configurable: true,
    writable: true,
    value: 360
  });
  panel.getBoundingClientRect = () => ({
    left: 140,
    right: 430,
    bottom: 120
  });

  moreMenu.setAttribute('open', 'open');
  moreMenu.dispatchEvent(new dom.window.Event('toggle'));

  assert.equal(panel.style.transform, 'translateX(-78px)', 'Wide generic menus should shift left to stay within the viewport');
});

test('configuration flyout clamps horizontally when it would overflow the viewport', async () => {
  const dom = await bootDom();
  const doc = dom.window.document;
  const configMenu = doc.getElementById('configMenu');
  const panel = configMenu.querySelector('.menu-panel');

  Object.defineProperty(dom.window, 'innerWidth', {
    configurable: true,
    writable: true,
    value: 360
  });
  panel.getBoundingClientRect = () => ({
    left: -96,
    right: 220,
    bottom: 180
  });

  configMenu.setAttribute('open', 'open');
  configMenu.dispatchEvent(new dom.window.Event('toggle'));
  await flushFrames(dom.window, 2);

  assert.equal(panel.style.transform, 'translateX(104px)', 'Configuration should shift right to stay within the viewport on narrow layouts');
});

test('readiness issues inside iom menu focus target field and close menu', async () => {
  const dom = await bootDom();
  const doc = dom.window.document;

  const dueDate = doc.getElementById('dueDate');
  dueDate.value = '';
  dom.window.compute();
  dom.window.updateIomUxState();

  const issueBtn = doc.querySelector('#readinessIssueList button[data-target="dueDate"]');
  assert.ok(issueBtn, 'Due date issue should appear in readiness issue list');

  const details = doc.getElementById('iomMenu');
  assert.ok(details.contains(doc.getElementById('financeReadinessBadge')), 'Readiness badge should live inside Make IOM');
  details.setAttribute('open', 'open');
  issueBtn.click();

  assert.equal(doc.activeElement && doc.activeElement.id, 'dueDate', 'Clicking go-fix should focus due date field');
  assert.equal(details.hasAttribute('open'), false, 'Clicking go-fix should close Make IOM menu');
});

test('blocked iom menu keyboard navigation skips disabled IOM actions', async () => {
  const dom = await bootDom();
  const doc = dom.window.document;
  const iomMenu = doc.getElementById('iomMenu');
  const autoPrintItem = doc.querySelector('#iomMenuPanel label[role="menuitemcheckbox"]');

  doc.getElementById('dueDate').value = '';
  dom.window.compute();
  iomMenu.setAttribute('open', 'open');
  iomMenu.dispatchEvent(new dom.window.Event('toggle'));

  assert.equal(doc.activeElement && doc.activeElement.dataset && doc.activeElement.dataset.target, 'dueDate', 'Blocked menu should start on the go-fix action');

  doc.dispatchEvent(new dom.window.KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));

  assert.equal(doc.activeElement, autoPrintItem, 'Arrow navigation should skip disabled Render/Save/Open actions');
});

test('iom panel css constrains height and enables scrolling', async () => {
  const dom = await bootDom();
  const doc = dom.window.document;
  const styleText = Array.from(doc.querySelectorAll('style')).map(el => el.textContent || '').join('\n');
  const iomPanelRule = styleText.match(/\.iom-panel\{[\s\S]*?\}/);

  assert.ok(iomPanelRule, 'Expected a CSS rule for .iom-panel');
  assert.match(iomPanelRule[0], /max-height:/, 'IOM panel should cap its height within the viewport');
  assert.match(iomPanelRule[0], /overflow:auto/, 'IOM panel should scroll when content exceeds the viewport');
});

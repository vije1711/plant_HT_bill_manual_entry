const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

test('static head title and fallback info-bar rule are present', () => {
  const src = fs.readFileSync(path.join(__dirname, '..', '1.4.1 GUI Entry.html'), 'utf8');
  // Static <title> should be aligned with product naming
  assert.ok(
    /<title>\s*IOM\s*-\s*HT\s*Bill\s*Calculator\s*<\/title>/i.test(src),
    'Static <title> must be "IOM - HT Bill Calculator"'
  );
  // Fallback CSS must include .info-bar styling (single line + ellipsis)
  assert.ok(
    /\.info-bar\{[^}]*white-space:nowrap;[^}]*text-overflow:ellipsis/si.test(src),
    'Fallback CSS must style .info-bar for nowrap + ellipsis'
  );
  // Fallback CSS must style the document title using the current selector
  assert.ok(
    /\.doc-header\s*h2\{[^}]*font-size:\s*18pt/si.test(src),
    'Fallback CSS must style .doc-header h2 (not the obsolete .doc-header .left h2)'
  );

  // Primary #print-css must lock light scheme (prevent dark-mode inversion)
  const cssBlockMatch = src.match(/<style\s+id=["']print-css["'][^>]*>([\s\S]*?)<\/style>/i);
  assert.ok(cssBlockMatch, 'Primary #print-css block should exist');
  const cssBlock = cssBlockMatch[1];
  assert.ok(
    /:root\s*\{\s*color-scheme:\s*light\s+only\s*;?/i.test(cssBlock),
    'Primary #print-css must include :root { color-scheme: light only; }'
  );

  // Export HTML template must explicitly set color-scheme meta to light
  assert.ok(/<meta\s+name=["']color-scheme["']\s+content=["']light["']\s*>/i.test(src), 'Export HTML must set color-scheme=light');

  // Primary print CSS (#print-css) should also enforce nowrap + ellipsis on .info-bar
  assert.ok(
    /\.info-bar\s*\{[^}]*white-space:\s*nowrap;[^}]*text-overflow:\s*ellipsis/si.test(cssBlock),
    'Primary #print-css must style .info-bar for nowrap + ellipsis'
  );

  // Fallback export window must set its own title correctly
  assert.ok(
    /<title>\s*IOM\s*-\s*HT\s*Bill\$\{month\}\s*<\/title>/i.test(src),
    'Fallback export HTML <title> must start with "IOM - HT Bill"'
  );
});

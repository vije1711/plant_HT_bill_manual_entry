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
  // Fallback CSS must allow wrapping (no truncation) and intra-token breaking
  assert.ok(
    /\.info-bar\{[^}]*white-space:\s*normal;[^}]*overflow:\s*visible;[^}]*text-overflow:\s*clip/si.test(src),
    'Fallback CSS must style .info-bar for wrapping'
  );
  assert.ok(
    /\.info-bar\{[^}]*overflow-wrap:\s*anywhere/si.test(src) || /\.info-bar\{[^}]*word-break:\s*break-word/si.test(src),
    'Fallback CSS must enable intra-token wrapping (overflow-wrap:anywhere or word-break:break-word)'
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

  // Primary print CSS must allow wrapping and intra-token breaking
  assert.ok(
    /\.info-bar\s*\{[^}]*white-space:\s*normal;[^}]*overflow:\s*visible;[^}]*text-overflow:\s*clip/si.test(cssBlock),
    'Primary #print-css must style .info-bar for wrapping'
  );
  assert.ok(
    /\.info-bar[^}]*overflow-wrap:\s*anywhere/si.test(cssBlock) || /\.info-bar[^}]*word-break:\s*break-word/si.test(cssBlock),
    'Primary #print-css must enable intra-token wrapping (overflow-wrap:anywhere or word-break:break-word)'
  );
  // Guard against regressions to truncation
  assert.ok(!/\.info-bar[^}]*white-space:\s*nowrap/si.test(cssBlock), 'No nowrap on .info-bar');
  assert.ok(!/\.info-bar[^}]*text-overflow:\s*ellipsis/si.test(cssBlock), 'No ellipsis on .info-bar');

  // Fallback export window must set its own title correctly
  assert.ok(
    /<title>\s*IOM\s*-\s*HT\s*Bill\$\{month\}\s*<\/title>/i.test(src),
    'Fallback export HTML <title> must start with "IOM - HT Bill"'
  );
});

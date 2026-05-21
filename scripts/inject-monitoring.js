#!/usr/bin/env node
// Usage: node scripts/inject-monitoring.js [distPath]
// Reads environment variables SENTRY_DSN, POSTHOG_KEY, ENVIRONMENT or uses provided defaults

const fs = require('fs');
const path = require('path');

const dist = process.argv[2] || 'dist/client';

function findIndexHtml(rootDir) {
  const directIndex = path.join(rootDir, 'index.html');
  if (fs.existsSync(directIndex)) {
    return directIndex;
  }

  const browserIndex = path.join(rootDir, 'browser', 'index.html');
  if (fs.existsSync(browserIndex)) {
    return browserIndex;
  }

  if (!fs.existsSync(rootDir) || !fs.statSync(rootDir).isDirectory()) {
    return null;
  }

  const entries = fs.readdirSync(rootDir, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const nested = findIndexHtml(path.join(rootDir, entry.name));
    if (nested) return nested;
  }

  return null;
}

const indexPath = findIndexHtml(dist);

if (!indexPath) {
  console.error('index.html not found under', dist);
  process.exit(2);
}

let html = fs.readFileSync(indexPath, 'utf8');

const sentry = process.env.SENTRY_DSN || '';
const posthog = process.env.POSTHOG_KEY || '';
const env = process.env.ENVIRONMENT || 'production';

html = html.replace('%SENTRY_DSN%', sentry);
html = html.replace('%POSTHOG_KEY%', posthog);
html = html.replace('%ENVIRONMENT%', env);

fs.writeFileSync(indexPath, html, 'utf8');
console.log('Injected monitoring keys into', indexPath);


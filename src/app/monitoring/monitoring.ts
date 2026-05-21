import * as Sentry from '@sentry/browser';
import { BrowserTracing } from '@sentry/tracing';
import posthog from 'posthog-js';

const DEFAULT_SENTRY_DSN = '<YOUR_SENTRY_DSN>';
const DEFAULT_POSTHOG_KEY = '<YOUR_POSTHOG_KEY>';

let sentryEnabled = false;
let posthogEnabled = false;

function isConfiguredValue(value: unknown, placeholder: string) {
  return (
    typeof value === 'string' &&
    value.trim() !== '' &&
    value !== placeholder &&
    !value.includes('%')
  );
}

export function initMonitoring(opts?: {
  sentryDsn?: string;
  posthogKey?: string;
  environment?: string;
}) {
  const cfg = (window as any).__MONITORING__ || {};
  const sentryDsn = opts?.sentryDsn ?? cfg.SENTRY_DSN ?? DEFAULT_SENTRY_DSN;
  const posthogKey = opts?.posthogKey ?? cfg.POSTHOG_KEY ?? DEFAULT_POSTHOG_KEY;
  const environment = opts?.environment ?? cfg.ENVIRONMENT ?? 'production';

  if (isConfiguredValue(sentryDsn, DEFAULT_SENTRY_DSN)) {
    Sentry.init({
      dsn: sentryDsn,
      integrations: [new BrowserTracing({ tracingOrigins: ['localhost', /^\//] })],
      tracesSampleRate: 0.05,
      environment,
    });
    sentryEnabled = true;
    console.info('Sentry initialized');
  } else {
    console.info('Sentry not initialized: set window.__MONITORING__.SENTRY_DSN to enable');
  }

  if (isConfiguredValue(posthogKey, DEFAULT_POSTHOG_KEY)) {
    posthog.init(posthogKey, { api_host: 'https://app.posthog.com' });
    posthogEnabled = true;
    console.info('PostHog initialized');
  } else {
    console.info('PostHog not initialized: set window.__MONITORING__.POSTHOG_KEY to enable');
  }

  // expose demo trigger globally for quick demo during defense
  (window as any).triggerMonitoringDemo = triggerDemo;
}

export function captureException(e: unknown) {
  try {
    if (sentryEnabled) Sentry.captureException(e as any);
  } catch (err) {
    console.error('Error capturing exception to Sentry', err);
  }
}

export function captureEvent(name: string, props?: Record<string, any>) {
  try {
    if (posthogEnabled) posthog.capture(name, props ?? {});
  } catch (err) {
    console.error('Error capturing event to PostHog', err);
  }
}

export function triggerDemo() {
  captureEvent('demo_event', { from: 'manual_demo' });
  captureException(new Error('Demo error triggered from triggerMonitoringDemo()'));
  console.info('Monitoring demo triggered (check Sentry / PostHog)');
}

export default {
  initMonitoring,
  captureException,
  captureEvent,
  triggerDemo,
};

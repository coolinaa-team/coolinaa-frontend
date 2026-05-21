import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app.component';
import { initMonitoring } from './app/monitoring/monitoring';

// Initialize monitoring early (Sentry / PostHog). Configure via window.__MONITORING__
// Example in browser console before app load:
// window.__MONITORING__ = { SENTRY_DSN: 'https://...', POSTHOG_KEY: 'ph_...', ENVIRONMENT: 'development' }
initMonitoring();

bootstrapApplication(App, appConfig).catch((err) => console.error(err));

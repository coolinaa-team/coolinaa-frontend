import { provideTaiga } from '@taiga-ui/core';
import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideServiceWorker } from '@angular/service-worker';
import { isDevMode } from '@angular/core';

import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';

const isSecureLocalContext =
  typeof location !== 'undefined' &&
  (location.protocol === 'https:' || location.hostname === 'localhost');

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor, errorInterceptor])),
    provideAnimations(),
    provideTaiga(),
    provideServiceWorker('ngsw-worker.js', {
      enabled: isSecureLocalContext || !isDevMode(),
      registrationStrategy: 'registerImmediately',
    }),
  ],
};

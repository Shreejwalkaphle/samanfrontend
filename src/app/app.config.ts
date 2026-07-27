import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { withComponentInputBinding } from '@angular/router';

import { routes } from './app.routes';

/**
 * provideZonelessChangeDetection(): opts this app OUT of Zone.js entirely.
 * Traditional Angular apps auto-detect changes by monkey-patching every
 * browser async API (setTimeout, Promise, event listeners, etc.) via Zone.js —
 * this works "automatically" but at a real performance cost (Angular re-checks
 * the ENTIRE component tree on every single async event, whether relevant or
 * not) and adds a large, invisible dependency most developers never think
 * about. Zoneless mode removes that entirely: change detection instead runs
 * ONLY when a Signal actually changes (or an OnPush component's @Input
 * reference changes) — faster, and forces explicit, intentional state
 * management via Signals rather than implicit "anything might trigger a
 * re-render" behavior. This is the single biggest conceptual shift from
 * Angular 4 (which this project's developer already knows) to modern Angular,
 * flagged as such in the project roadmap.
 */
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    // withComponentInputBinding(): lets route parameters (e.g. :slug) and
    // query params flow DIRECTLY into a component's input() signals, without
    // manually subscribing to ActivatedRoute.params (the Angular 4-era way).
    // Must be explicitly enabled here — off by default.
    provideRouter(routes, withComponentInputBinding()),

    // provideHttpClient(): registers Angular's HttpClient service app-wide —
    // without this, injecting HttpClient anywhere (e.g. in AuthService) would
    // fail at runtime with "no provider found."
    // withInterceptors([authInterceptor]): registers our custom interceptor
    // (built in Step 3 below) — every outgoing HTTP request automatically
    // passes through it first, which is how the JWT gets attached to every
    // backend call without each service manually adding a header.
    provideHttpClient(withInterceptors([authInterceptor])),
  ],
};

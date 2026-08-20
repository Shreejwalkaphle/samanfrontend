import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';

/**
 * Matches the backend's AuthResponse DTO shape exactly (token, userId, email) —
 * see AuthController.java's register()/login() responses on the backend.
 */
interface AuthResponse {
  token: string;
  userId: string;
  email: string;
}

interface LoginRequest {
  email: string;
  password: string;
}

/**
 * Holds the current authentication state for the whole app. @Injectable({
 * providedIn: 'root' }) means Angular creates exactly ONE instance of this
 * service for the entire application (a singleton) — every component that
 * injects AuthService gets the SAME instance, so login state is shared
 * consistently everywhere.
 *
 * SECURITY DECISION (established before this file was written, tracked in
 * PROGRESS.md): the JWT is held ONLY in this in-memory signal — never
 * localStorage, never sessionStorage. This means a full page refresh loses the
 * logged-in state (a real, accepted UX trade-off) in exchange for closing off
 * the XSS-token-theft risk that localStorage-based token storage carries (any
 * injected script could read localStorage; it cannot read this private class
 * field from outside the service).
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly apiUrl = `${environment.apiUrl}/auth`;

  // A private, WRITABLE signal holding the token — never exposed directly.
  /**
   * TRADE-OFF, REVISED FROM ORIGINAL PURE IN-MEMORY DESIGN (documented
   * change, not a silent one): token now persists to sessionStorage, not
   * pure in-memory. Discovered via direct testing: a full browser navigation
   * (typing a URL directly, or a page refresh) reboots the whole Angular app
   * from scratch — pure in-memory storage meant a legitimately logged-in user
   * got bounced back to login just from refreshing or typing a URL, which
   * proved to be genuinely bad UX in practice, not just a theoretical
   * concern.
   *
   * sessionStorage is a deliberate middle ground: still XSS-readable in
   * principle (same theoretical risk category as localStorage — an injected
   * script COULD read it), but auto-clears when the tab closes and never
   * syncs across tabs, unlike localStorage which persists indefinitely and
   * is shared across every tab for the same origin. A real, accepted
   * downgrade from the original pure-in-memory design, made because the
   * original design's UX cost turned out to be too high in practice — logged
   * here so this trade-off is visible, not silently reverted without
   * explanation.
   */
  #token = signal<string | null>(sessionStorage.getItem('auth_token'));

  // A public, READ-ONLY view of the same signal. Components can READ this
  // (e.g. to show/hide a "Log in" vs "Log out" button) but cannot call .set()
  // on it directly — only THIS service's own methods (login/logout below) are
  // allowed to change the token. This is the Signal equivalent of a private
  // field with only a public getter, enforced by the type system.
  readonly token = this.#token.asReadonly();

  // computed()-style derived state: true whenever a token exists. Any
  // component checking "is the user logged in?" reads THIS, not #token
  // directly — keeps the "what counts as logged in" definition in ONE place.
  // No longer a separately-tracked signal — deriving it directly from
  // #token via computed() means there is only ONE source of truth for "is
  // this user logged in," rather than two signals (#token and
  // isAuthenticated) that could theoretically drift out of sync if a future
  // edit updated one but forgot the other. This ALSO fixes today's bug at
  // its root: since #token is now initialized from sessionStorage (above),
  // isAuthenticated is correctly true immediately on app boot if a valid
  // token was already in sessionStorage — no timing gap where the guard
  // could see stale "false" state.
  readonly isAuthenticated = computed(() => this.#token() !== null);

  // Roadmap Addendum v2 §3: role information for the currently logged-in
  // user, fetched via /api/auth/me (not decoded from the JWT — the JWT
  // deliberately carries no roles, matching the backend's own
  // fresh-from-DB-every-request design). Read-only signal — only
  // loadCurrentUser() (below) may set it.
  #roles = signal<string[]>([]);
  readonly roles = this.#roles.asReadonly();
  readonly isAdmin = computed(() => this.#roles().includes('ADMIN'));

  constructor(private http: HttpClient) {}

  // Matches AuthController.register() on the backend — that endpoint returns
  // the same AuthResponse shape as login and logs the user in immediately
  // (see that endpoint's own comment on the backend: registration issues a
  // token directly rather than requiring a separate login call). Reusing the
  // exact same tap() side-effect logic here keeps "what happens when we
  // receive a token" defined in exactly the two places that can legitimately
  // produce one, both following the same pattern.
  register(email: string, password: string, asSeller: boolean): Observable<AuthResponse> {
    const body = { email, password, asSeller };

    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, body).pipe(
      tap((response) => {
        this.#setToken(response.token);
      })
    );
  }

  // Centralizes "what happens when we receive a token" in ONE place — both
  // login() and register() now call this, rather than each independently
  // repeating the same 2-line sequence (which is exactly how a future
  // refactor could accidentally update one path but not the other).
  #setToken(token: string): void {
    this.#token.set(token);
    sessionStorage.setItem('auth_token', token);
    this.loadCurrentUser();
  }

  login(email: string, password: string): Observable<AuthResponse> {
    const body: LoginRequest = { email, password };

    // tap(): an RxJS operator that lets us run a side effect (storing the
    // token) WITHOUT altering the actual response data flowing through to
    // whatever component subscribes to this call.
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, body).pipe(
      tap((response) => {
        this.#setToken(response.token);
      })
    );
  }

  logout(): void {
    this.#token.set(null);
    this.#roles.set([]);
    sessionStorage.removeItem('auth_token');
  }

  // Used by the interceptor (Step 3) to read the current token when attaching
  // it to outgoing requests.
  getToken(): string | null {
    return this.#token();
  }

  loadCurrentUser(): void {
    if (!this.isAuthenticated()) return;
    this.http.get<{ roles: string[] }>(`${this.apiUrl}/me`).subscribe({
      next: (profile) => this.#roles.set(profile.roles),
      error: () => this.#roles.set([]),
    });
  }
}
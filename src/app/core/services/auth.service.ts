import { Injectable, signal } from '@angular/core';
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
  #token = signal<string | null>(null);

  // A public, READ-ONLY view of the same signal. Components can READ this
  // (e.g. to show/hide a "Log in" vs "Log out" button) but cannot call .set()
  // on it directly — only THIS service's own methods (login/logout below) are
  // allowed to change the token. This is the Signal equivalent of a private
  // field with only a public getter, enforced by the type system.
  readonly token = this.#token.asReadonly();

  // computed()-style derived state: true whenever a token exists. Any
  // component checking "is the user logged in?" reads THIS, not #token
  // directly — keeps the "what counts as logged in" definition in ONE place.
  readonly isAuthenticated = signal(false);

  constructor(private http: HttpClient) {}

  // Matches AuthController.register() on the backend — that endpoint returns
  // the same AuthResponse shape as login and logs the user in immediately
  // (see that endpoint's own comment on the backend: registration issues a
  // token directly rather than requiring a separate login call). Reusing the
  // exact same tap() side-effect logic here keeps "what happens when we
  // receive a token" defined in exactly the two places that can legitimately
  // produce one, both following the same pattern.
  register(email: string, password: string): Observable<AuthResponse> {
    const body: LoginRequest = { email, password }; // same shape as login's request

    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, body).pipe(
      tap((response) => {
        this.#token.set(response.token);
        this.isAuthenticated.set(true);
      })
    );
  }

  login(email: string, password: string): Observable<AuthResponse> {
    const body: LoginRequest = { email, password };

    // tap(): an RxJS operator that lets us run a side effect (storing the
    // token) WITHOUT altering the actual response data flowing through to
    // whatever component subscribes to this call.
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, body).pipe(
      tap((response) => {
        this.#token.set(response.token);
        this.isAuthenticated.set(true);
      })
    );
  }

  logout(): void {
    this.#token.set(null);
    this.isAuthenticated.set(false);
  }

  // Used by the interceptor (Step 3) to read the current token when attaching
  // it to outgoing requests.
  getToken(): string | null {
    return this.#token();
  }
}
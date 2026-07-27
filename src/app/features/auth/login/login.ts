import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  // Reactive Forms (Angular's own, established form-handling choice per the
  // project roadmap — Signal Forms are still maturing, deliberately not used
  // yet). Validators mirror the backend's RegisterRequest/LoginRequest @Valid
  // rules where practical — client-side validation is a UX nicety (instant
  // feedback), NOT a security boundary; the backend's own @Valid checks
  // remain the actual enforcement point regardless of what this form does.
  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  // Signals for simple local UI state — no Zone.js "magic" re-render here;
  // the template re-renders precisely because these specific signals changed.
  isSubmitting = signal(false);
  errorMessage = signal<string | null>(null);

  onSubmit(): void {
    if (this.loginForm.invalid) {
      // markAllAsTouched(): forces Angular to show validation error messages
      // on every field, even ones the user never clicked into — without this,
      // a completely empty form submitted immediately would show NO errors at
      // all, which is confusing UX.
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    const { email, password } = this.loginForm.getRawValue();

    this.authService.login(email!, password!).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        // Navigation after successful login — destination is a placeholder
        // for now (no dashboard/home feature built yet); will be revisited
        // once there's a real post-login landing page.
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.isSubmitting.set(false);
        // The backend's GlobalExceptionHandler ErrorResponse shape has a
        // "message" field — surfacing it directly here. Reasonably safe to
        // show as-is: GlobalExceptionHandler was specifically designed to
        // never leak internal details in that field, only intentional,
        // client-safe messages (e.g. "Invalid email or password").
        this.errorMessage.set(err.error?.message ?? 'Login failed. Please try again.');
      },
    });
  }
}
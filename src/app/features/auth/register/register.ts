import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class Register {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  // minLength(8) mirrors the backend's RegisterRequest @Size(min = 8) rule —
  // client-side UX convenience only, backend remains the real enforcement
  // boundary (same principle noted on Login's form).
  registerForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    // Roadmap Addendum v2 §1.2: opt-in seller registration. Defaults to
    // false (regular customer) — matches backend's RegisterRequest.asSeller
    // default behavior exactly.
    asSeller: [false],
  });

  isSubmitting = signal(false);
  errorMessage = signal<string | null>(null);

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    const { email, password, asSeller } = this.registerForm.getRawValue();

    this.authService.register(email!, password!, asSeller!).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        // Registration logs the user in immediately (same as the backend's
        // own design — see AuthService.register()'s comment) — navigating
        // straight to the home placeholder, no separate "please log in" step
        // needed.
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.isSubmitting.set(false);
        // DuplicateEmailException's message ("An account with email '...'
        // already exists") is safe to show as-is — GlobalExceptionHandler was
        // specifically designed so every message reaching this point is
        // intentional and client-safe.
        this.errorMessage.set(err.error?.message ?? 'Registration failed. Please try again.');
      },
    });
  }
}
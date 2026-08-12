import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AdminService } from '../admin.service';

@Component({
  selector: 'app-create-category',
  imports: [ReactiveFormsModule],
  templateUrl: './create-category.html',
  styleUrl: './create-category.scss',
})
export class CreateCategory {
  private fb = inject(FormBuilder);
  private adminService = inject(AdminService);

  categoryForm = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
    description: ['', [Validators.maxLength(500)]],
  });

  isSubmitting = signal(false);
  successMessage = signal<string | null>(null);
  errorMessage = signal<string | null>(null);

  onSubmit(): void {
    if (this.categoryForm.invalid) {
      this.categoryForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.successMessage.set(null);
    this.errorMessage.set(null);

    const { name, description } = this.categoryForm.getRawValue();

    this.adminService.createCategory({ name: name!, description: description ?? '', parentId: null }).subscribe({
      next: (category) => {
        this.isSubmitting.set(false);
        this.successMessage.set(`Category "${category.name}" created successfully.`);
        this.categoryForm.reset();
      },
      error: (err) => {
        this.isSubmitting.set(false);
        // If a non-admin somehow reaches this form, the backend's 403
        // ("You do not have permission to perform this action" — the exact
        // message from yesterday's GlobalExceptionHandler fix) surfaces
        // here directly. This IS the real enforcement working as intended,
        // not a bug — the frontend form's mere existence never granted
        // access, the backend @PreAuthorize check did the actual work.
        this.errorMessage.set(err.error?.message ?? 'Failed to create category.');
      },
    });
  }
}
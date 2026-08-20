import { Component, inject, signal, OnInit } from '@angular/core';
import { AdminService } from '../admin.service';
import { SellerApplication } from '../seller-application.model';

@Component({
  selector: 'app-pending-sellers',
  imports: [],
  templateUrl: './pending-sellers.html',
  styleUrl: './pending-sellers.scss',
})
export class PendingSellers implements OnInit {
  private adminService = inject(AdminService);

  applications = signal<SellerApplication[]>([]);
  isLoading = signal(true);
  errorMessage = signal<string | null>(null);

  ngOnInit(): void {
    this.loadPending();
  }

  private loadPending(): void {
    this.isLoading.set(true);
    this.adminService.getPendingSellers().subscribe({
      next: (apps) => {
        this.applications.set(apps);
        this.isLoading.set(false);
      },
      error: (err) => {
        // Surface the backend's actual message (e.g. "You do not have
        // permission to perform this action") rather than a generic
        // fallback — same principle established since Login's error
        // handling: GlobalExceptionHandler's messages are always
        // intentional and client-safe, hiding them behind a generic string
        // loses useful, correct information for no security benefit.
        this.errorMessage.set(err.error?.message ?? 'Failed to load pending sellers.');
        this.isLoading.set(false);
      },
    });
  }

  onApprove(userId: string): void {
    this.adminService.approveSeller(userId).subscribe({
      next: () => this.loadPending(), // refresh list — approved user should
                                        // disappear from the PENDING list
      error: (err) => this.errorMessage.set(err.error?.message ?? 'Approval failed.'),
    });
  }

  onReject(userId: string): void {
    this.adminService.rejectSeller(userId).subscribe({
      next: () => this.loadPending(),
      error: (err) => this.errorMessage.set(err.error?.message ?? 'Rejection failed.'),
    });
  }
}
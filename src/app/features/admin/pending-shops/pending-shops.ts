import { Component, inject, signal, OnInit } from '@angular/core';
import { AdminService } from '../admin.service';
import { ShopApplication } from '../shop.model';

@Component({
  selector: 'app-pending-shops',
  imports: [],
  templateUrl: './pending-shops.html',
  styleUrl: './pending-shops.scss',
})
export class PendingShops implements OnInit {
  private adminService = inject(AdminService);

  applications = signal<ShopApplication[]>([]);
  isLoading = signal(true);
  errorMessage = signal<string | null>(null);

  ngOnInit(): void {
    this.loadPending();
  }

  private loadPending(): void {
    this.isLoading.set(true);
    this.adminService.getPendingShops().subscribe({
      next: (page) => {
        this.applications.set(page.content);
        this.isLoading.set(false);
      },
      error: (err) => {
        // Surface the backend's actual message (e.g. "You do not have
        // permission to perform this action") rather than a generic
        // fallback — same principle established since Login's error
        // handling: GlobalExceptionHandler's messages are always
        // intentional and client-safe, hiding them behind a generic string
        // loses useful, correct information for no security benefit.
        this.errorMessage.set(err.error?.message ?? 'Failed to load pending shops.');
        this.isLoading.set(false);
      },
    });
  }

  onApprove(shopId: string): void {
    this.adminService.approveShop(shopId).subscribe({
      next: () => this.loadPending(), // refresh list — approved user should
                                        // disappear from the PENDING list
      error: (err) => this.errorMessage.set(err.error?.message ?? 'Approval failed.'),
    });
  }

  onReject(shopId: string): void {
    const reason = prompt('Reason for rejecting this shop?')?.trim();
    if (!reason) return;
    this.adminService.rejectShop(shopId, reason).subscribe({
      next: () => this.loadPending(),
      error: (err) => this.errorMessage.set(err.error?.message ?? 'Rejection failed.'),
    });
  }
}

import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { PaymentService } from '../payment.service';

@Component({
  selector: 'app-esewa-result',
  imports: [RouterLink],
  templateUrl: './esewa-result.html',
  styleUrl: './esewa-result.scss',
})
export class EsewaResult implements OnInit {
  private route = inject(ActivatedRoute);
  private paymentService = inject(PaymentService);

  state = signal<'verifying' | 'success' | 'failure'>('verifying');
  message = signal('Verifying your payment securely with eSewa...');

  ngOnInit(): void {
    const expectedOutcome = this.route.snapshot.data['outcome'];
    if (expectedOutcome === 'failure') {
      this.state.set('failure');
      this.message.set('The eSewa payment was cancelled or did not complete.');
      return;
    }

    const data = this.route.snapshot.queryParamMap.get('data');
    if (!data) {
      this.state.set('failure');
      this.message.set('eSewa did not return payment verification data.');
      return;
    }

    this.paymentService.completeEsewa(data).subscribe({
      next: (payment) => {
        if (payment.status === 'SUCCESS') {
          this.state.set('success');
          this.message.set('Payment verified. Your order is now paid.');
        } else {
          this.state.set('failure');
          this.message.set('Payment is still pending verification.');
        }
      },
      error: (error) => {
        this.state.set('failure');
        this.message.set(error.error?.message ?? 'Payment verification failed.');
      },
    });
  }
}

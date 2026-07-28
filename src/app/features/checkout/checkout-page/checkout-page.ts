import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { OrderService } from '../order.service';
import { Order } from '../order.model';
import { PaymentService } from '../../payment/payment.service';
import { GatewayType, PaymentResponse } from '../../payment/payment.model';
import { CartService } from '../../cart/cart.service';

/**
 * A simple state machine driving which part of the checkout flow is shown.
 * Kept as a plain string-literal type + Signal, rather than a separate
 * routed page per step — the whole flow stays on one URL (/checkout), which
 * matches how a real checkout experience typically feels (one continuous
 * flow, not a series of full page navigations).
 */
type CheckoutStep = 'review' | 'selectGateway' | 'awaitingPayment' | 'complete';

@Component({
  selector: 'app-checkout-page',
  imports: [RouterLink],
  templateUrl: './checkout-page.html',
  styleUrl: './checkout-page.scss',
})
export class CheckoutPage {
  private orderService = inject(OrderService);
  private paymentService = inject(PaymentService);
  cartService = inject(CartService); // public — template reads cart directly

  step = signal<CheckoutStep>('review');
  order = signal<Order | null>(null);
  payment = signal<PaymentResponse | null>(null);
  errorMessage = signal<string | null>(null);
  isProcessing = signal(false);

  /**
   * A fresh idempotency key generated ONCE when this component is created —
   * crypto.randomUUID() is the browser's built-in, standards-based UUID
   * generator (no library needed). This exact key is reused for every retry
   * of THIS checkout attempt (e.g. if placeOrder() fails and the user clicks
   * again) — regenerating it per click would defeat idempotency's entire
   * purpose, since the backend's protection specifically depends on seeing
   * the SAME key on a retry.
   */
  private checkoutIdempotencyKey = crypto.randomUUID();

  placeOrder(): void {
    this.isProcessing.set(true);
    this.errorMessage.set(null);

    this.orderService.checkout(this.checkoutIdempotencyKey).subscribe({
      next: (order) => {
        this.order.set(order);
        this.step.set('selectGateway');
        this.isProcessing.set(false);
        // Backend cleared the cart as part of a successful checkout —
        // refresh the shared Signal so any other part of the UI (e.g. a
        // future navbar cart-count) reflects that too.
        this.cartService.refreshCart();
      },
      error: (err) => {
        this.errorMessage.set(err.error?.message ?? 'Checkout failed. Please try again.');
        this.isProcessing.set(false);
      },
    });
  }

  selectGateway(gateway: GatewayType): void {
    const currentOrder = this.order();
    if (!currentOrder) return;

    this.isProcessing.set(true);
    this.errorMessage.set(null);

    // A SEPARATE idempotency key from checkout's own — payment initiation is
    // its own distinct retriable operation on the backend (see
    // PaymentService.java's own idempotency check), so it gets its own key,
    // matching the backend design doc's explicit reasoning for why two
    // separate keys exist rather than reusing one.
    const paymentIdempotencyKey = crypto.randomUUID();

    this.paymentService.initiate(currentOrder.id, gateway, paymentIdempotencyKey).subscribe({
      next: (payment) => {
        this.payment.set(payment);
        this.step.set('awaitingPayment');
        this.isProcessing.set(false);
      },
      error: (err) => {
        this.errorMessage.set(err.error?.message ?? 'Could not start payment.');
        this.isProcessing.set(false);
      },
    });
  }

  /**
   * HONEST LIMITATION, carried over directly from the backend (see Payment
   * module design doc §3): no real gateway is connected yet. A real flow
   * would redirect the customer to payment.redirectUrl and a webhook would
   * confirm payment automatically afterward. This button simulates "the
   * customer completed payment on the gateway's page" by calling the
   * confirm endpoint directly — the same simplification the backend's
   * confirm endpoint itself already documents.
   */
  simulateCompletePayment(): void {
    const currentPayment = this.payment();
    if (!currentPayment) return;

    this.isProcessing.set(true);

    this.paymentService.confirm(currentPayment.id).subscribe({
      next: (confirmedPayment) => {
        this.payment.set(confirmedPayment);
        this.step.set('complete');
        this.isProcessing.set(false);
      },
      error: (err) => {
        this.errorMessage.set(err.error?.message ?? 'Payment confirmation failed.');
        this.isProcessing.set(false);
      },
    });
  }
}
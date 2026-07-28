import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { GatewayType, PaymentResponse } from './payment.model';

@Injectable({ providedIn: 'root' })
export class PaymentService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/payments`;

  /**
   * Mirrors PaymentController.initiate() — the Idempotency-Key HTTP header
   * (not a body field) matches the backend's exact convention, same as
   * OrderService.checkout() below.
   */
  initiate(orderId: string, gateway: GatewayType, idempotencyKey: string): Observable<PaymentResponse> {
    const headers = new HttpHeaders({ 'Idempotency-Key': idempotencyKey });
    return this.http.post<PaymentResponse>(
      `${this.apiUrl}/initiate`,
      { orderId, gateway },
      { headers }
    );
  }

  /**
   * Mirrors PaymentController.confirm() — no body needed, matches the
   * backend's POST /api/payments/{paymentId}/confirm signature exactly.
   */
  confirm(paymentId: string): Observable<PaymentResponse> {
    return this.http.post<PaymentResponse>(`${this.apiUrl}/${paymentId}/confirm`, {});
  }
}
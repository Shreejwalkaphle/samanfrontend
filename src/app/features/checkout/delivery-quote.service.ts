import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { DeliveryQuote, DeliveryQuoteRequest } from './delivery-quote.model';

@Injectable({ providedIn: 'root' })
export class DeliveryQuoteService {
  private http = inject(HttpClient);
  create(request: DeliveryQuoteRequest): Observable<DeliveryQuote> {
    return this.http.post<DeliveryQuote>(`${environment.apiUrl}/delivery/quotes`, request);
  }
}

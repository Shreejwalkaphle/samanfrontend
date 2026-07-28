import { Component, inject, OnInit } from '@angular/core';
import { CartService } from '../cart.service';

@Component({
  selector: 'app-cart-page',
  imports: [],
  templateUrl: './cart-page.html',
  styleUrl: './cart-page.scss',
})
export class CartPage implements OnInit {
  cartService = inject(CartService);

  ngOnInit(): void {
    this.cartService.refreshCart();
  }

  onRemove(itemId: string): void {
    this.cartService.removeItem(itemId).subscribe();
  }

  onQuantityChange(itemId: string, event: Event): void {
    const value = Number((event.target as HTMLInputElement).value);
    if (value > 0) {
      this.cartService.updateQuantity(itemId, value).subscribe();
    }
  }
}
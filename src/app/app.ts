import { Component, signal, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './core/services/auth.service';


@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  // TEMPORARY — just to visually confirm the signal is updating after login.
  // Will be removed once a real navbar/header component exists to show this
  // properly.
  authService = inject(AuthService);
  protected readonly title = signal('saman-frontend');
}

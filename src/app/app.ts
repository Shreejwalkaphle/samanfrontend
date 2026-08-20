import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from './shared/navbar/navbar';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navbar],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  // Ensures roles are loaded on a fresh app boot too (not just right after
  // login) — covers the case where a token already existed in
  // sessionStorage (e.g. page refresh) but roles were never fetched this
  // session.
  constructor(authService: AuthService) {
    authService.loadCurrentUser();
  }
}
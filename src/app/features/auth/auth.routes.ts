import { Routes } from '@angular/router';
import { Login } from './login/login';
import { Register } from './register/register';

/**
 * This is the "feature routing table" — it lists every URL path that belongs
 * to the AUTH feature, and which component handles each one. Right now there's
 * only one (login), but register/forgot-password will be added here later,
 * the same way.
 *
 * AUTH_ROUTES is just a normal exported constant — nothing magic. app.routes.ts
 * (the ROOT routing table) will import THIS file and mount everything in this
 * array under the "/auth" path prefix.
 */
export const AUTH_ROUTES: Routes = [
  {
    path: 'login',
    component: Login
  },
  {
    path: 'register',
    component: Register
  }
];
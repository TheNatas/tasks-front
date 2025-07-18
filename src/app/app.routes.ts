import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login';
import { authGuard } from './guards/auth-guard';
import { loginRedirectGuard } from './guards/login-redirect';
import { Home } from './pages/home/home';

export const routes: Routes = [
  { path: 'login', component: LoginComponent, canActivate: [loginRedirectGuard] },
  { path: '', component: Home, canActivate: [authGuard] }
];

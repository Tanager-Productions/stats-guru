import { Routes } from '@angular/router';
import { isLoggedIn } from './app.guards';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.page').then( m => m.LoginPage)
  },
  {
    path: 'home',
		canActivate: [isLoggedIn],
    loadChildren: () => import('./pages/home/home.routes').then( m => m.homeRoutes)
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'home'
  }
];

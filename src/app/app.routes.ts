import { Routes } from '@angular/router';
import { isLoggedIn } from './app.guards';

export const routes: Routes = [
	{
		path: 'login',
		loadComponent: () => import('./pages/login/login.page').then(m => m.LoginPage)
	},
	{
		path: 'games',
		canActivate: [isLoggedIn],
		children: [
			{
				path: '',
				loadComponent: () => import('./pages/games/games.component').then(m => m.GamesComponent),
			},
			{
				path: ':gameId',
				loadComponent: () => import('./pages/gamecast/gamecast.component').then(m => m.GamecastComponent)
			}
		]
	},
	{
		path: '',
		pathMatch: 'full',
		redirectTo: 'games'
	}
];

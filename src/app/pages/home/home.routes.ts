import { Routes } from '@angular/router';
import { GamesComponent } from './components/games/games.component';
import { GamecastComponent } from './components/gamecast/gamecast.component';

export const homeRoutes: Routes = [
  {
    path: 'games',
    component: GamesComponent
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'games'
  },
  {
    path: 'gamecast/:gameId',
    component: GamecastComponent
  }
];

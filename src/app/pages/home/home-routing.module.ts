import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GamesComponent } from './components/games/games.component';
import { AddGamesComponent } from '../../shared/add-games/add-games.component';
import { GamecastComponent } from './components/gamecast/gamecast.component';

const routes: Routes = [
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

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HomeRoutingModule { }

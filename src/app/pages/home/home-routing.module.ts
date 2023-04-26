import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomePage } from './home.page';
import { TestPageComponent } from 'src/app/test/test-page/test-page.component';
import { GamesComponent } from './components/games/games.component';
import { AddGamesComponent } from './components/add-games/add-games.component';
import { GamecastComponent } from './components/gamecast/gamecast.component';

const routes: Routes = [
  {
    path: '',
    component: HomePage,
    children: [
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
      },
      {
        path: 'add-game',
        component: AddGamesComponent
      },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HomeRoutingModule { }

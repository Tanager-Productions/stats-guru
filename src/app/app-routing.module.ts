import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { TestPageComponent } from './test/test-page/test-page.component';
import { GamecastComponent } from './pages/home/gamecast/gamecast.component';
import { GamesComponent } from './pages/home/games/games.component';
import { AddGamesComponent } from './pages/home/add-games/add-games.component';
const routes: Routes = [
  {
    path: 'login',
    pathMatch: 'full',
    component: LoginComponent
  },
  {
    path: 'test',
    pathMatch: 'full',
    component: TestPageComponent
  },
  {
    path: '',
    pathMatch: 'full',
    component: GamesComponent
  },
  { path: 'gamecast/:gameId', component: GamecastComponent },
  { path: 'add-game', component: AddGamesComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
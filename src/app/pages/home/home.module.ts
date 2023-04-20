import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HomeRoutingModule } from './home-routing.module';
import { GamesComponent } from './games/games.component';
import { GamecastComponent } from './gamecast/gamecast.component';
import { GamecastDetailComponent } from './gamecast-detail/gamecast-detail.component';
import { AddGamesComponent } from './add-games/add-games.component';


@NgModule({
  declarations: [
    GamesComponent,
    GamecastComponent,
    GamecastDetailComponent,
    AddGamesComponent
  ],
  imports: [
    CommonModule,
    HomeRoutingModule
  ]
})
export class HomeModule { }

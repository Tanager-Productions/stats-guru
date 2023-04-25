import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { HomeRoutingModule } from './home-routing.module';
import { GamesComponent } from './components/games/games.component';
import { GamecastComponent } from './components/gamecast/gamecast.component';
import { GamecastDetailComponent } from './components/gamecast-detail/gamecast-detail.component';
import { AddGamesComponent } from './components/add-games/add-games.component';
import { HomePage } from './home.page';


@NgModule({
  declarations: [
    HomePage,
    GamesComponent,
    GamecastComponent,
    GamecastDetailComponent,
    AddGamesComponent
  ],
  imports: [
    CommonModule,
    HomeRoutingModule,
    IonicModule
  ]
})
export class HomeModule { }

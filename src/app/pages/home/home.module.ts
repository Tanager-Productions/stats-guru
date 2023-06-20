import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { HomeRoutingModule } from './home-routing.module';
import { GamesComponent } from './components/games/games.component';
import { GamecastComponent } from './components/gamecast/gamecast.component';
import { GamecastDetailComponent } from './components/gamecast-detail/gamecast-detail.component';
import { AddGamesComponent } from './components/add-games/add-games.component';
import { HomePage } from './home.page';
import { SharedModule } from 'src/app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';


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
    IonicModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class HomeModule { }

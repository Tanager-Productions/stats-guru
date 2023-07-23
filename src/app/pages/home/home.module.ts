import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { HomeRoutingModule } from './home-routing.module';
import { GamesComponent } from './components/games/games.component';
import { GamecastComponent } from './components/gamecast/gamecast.component';
import { AddGamesComponent } from './components/add-games/add-games.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HammerModule } from '@angular/platform-browser';
import { AgGridModule } from 'ag-grid-angular';



@NgModule({
  declarations: [
    GamesComponent,
    GamecastComponent,
    AddGamesComponent
  ],
  imports: [
		AgGridModule,
    CommonModule,
    HomeRoutingModule,
    IonicModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
		HammerModule
  ]
})
export class HomeModule { }

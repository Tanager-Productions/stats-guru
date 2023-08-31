import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './header/header.component';
import { IonicModule } from '@ionic/angular';
import { AddPlayerComponent } from './add-player/add-player.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { EditPlayerComponent } from './edit-player/edit-player.component';
import { AgGridModule } from 'ag-grid-angular';
import { GamecastDetailComponent } from './gamecast-detail/gamecast-detail.component';
import { EditPeriodTotalComponent } from './edit-period-total/edit-period-total.component';
import { AddGamesComponent } from './add-games/add-games.component';

@NgModule({
  declarations: [
    HeaderComponent,
    AddPlayerComponent,
    EditPlayerComponent,
		GamecastDetailComponent,
  	EditPeriodTotalComponent,
		AddGamesComponent
  ],
  imports: [
		AgGridModule,
    CommonModule,
    IonicModule,
		FormsModule,
		ReactiveFormsModule
  ],
  exports: [
    HeaderComponent,
		AddPlayerComponent,
		EditPlayerComponent,
		GamecastDetailComponent,
		EditPeriodTotalComponent,
		AddGamesComponent
  ]
})
export class SharedModule { }

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './header/header.component';
import { IonicModule } from '@ionic/angular';
import { AddPlayerComponent } from './add-player/add-player.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { EditPlayerComponent } from './edit-player/edit-player.component';
import { AgGridModule } from 'ag-grid-angular';
import { GamecastDetailComponent } from './gamecast-detail/gamecast-detail.component';

@NgModule({
  declarations: [
    HeaderComponent,
    AddPlayerComponent,
    EditPlayerComponent,
		GamecastDetailComponent
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
		GamecastDetailComponent
  ]
})
export class SharedModule { }

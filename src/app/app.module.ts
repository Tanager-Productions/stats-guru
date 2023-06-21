import { NgModule } from '@angular/core';
import { BrowserModule, HammerModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { IonicModule } from '@ionic/angular';
import { HttpClientModule } from '@angular/common/http';
import { CommonService } from './services/common/common.service';
import { ApiService } from './services/api/api.service';
import { SyncService } from './services/sync/sync.service';
import { SqlService } from './services/sql/sql.service';
import { CrudService } from './services/crud/crud.service';
import { AuthService } from './services/auth/auth.service';
import { CommonModule } from '@angular/common';
import { HomeRoutingModule } from './pages/home/home-routing.module';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { SharedModule } from './shared/shared.module';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    DragDropModule,
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    CommonModule,
    HomeRoutingModule,
    IonicModule.forRoot({mode:'md'}),
    SharedModule,
		HammerModule
  ],
  providers: [
    CommonService,
    ApiService,
    SyncService,
    SqlService,
    CrudService,
    AuthService
  ],
  bootstrap: [
    AppComponent
  ]
})
export class AppModule { }


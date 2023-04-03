import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { IonicModule } from '@ionic/angular';
import { CommonService } from './services/common/common.service';
import { ApiService } from './services/api/api.service';
import { SyncService } from './services/sync/sync.service';
import { SqlService } from './services/sql/sql.service';
import { TgsDatabaseService } from './services/tgs/tgs-database.service';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    IonicModule.forRoot({mode:'md'})
  ],
  providers: [
    CommonService,
    ApiService,
    SyncService,
    SqlService,
    TgsDatabaseService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

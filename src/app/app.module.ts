import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { IonicModule } from '@ionic/angular';
import { CommonService } from './services/common/common.service';
import { ApiService } from './services/api/api.service';
import { SyncService } from './services/sync/sync.service';
import { SqlService } from './services/sql/sql.service';
import { CrudService } from './services/crud/crud.service';
import { TestPageComponent } from './test/test-page/test-page.component';

@NgModule({
  declarations: [
    AppComponent,
    TestPageComponent
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
    CrudService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

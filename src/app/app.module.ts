import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { IonicModule } from '@ionic/angular';
import { HttpClientModule } from '@angular/common/http';
import { CommonService } from './services/common/common.service';
import { ApiService } from './services/api/api.service';
import { SyncService } from './services/sync/sync.service';
import { SqlService } from './services/sql/sql.service';
import { CrudService } from './services/crud/crud.service';
import { TestPageComponent } from './test/test-page/test-page.component';
import { AuthService } from './services/auth/auth.service';
import { CommonModule } from '@angular/common';

@NgModule({
  declarations: [
    AppComponent,
    TestPageComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    CommonModule,
    IonicModule.forRoot({mode:'md'})
  ],
  providers: [
    CommonService,
    ApiService,
    SyncService,
    SqlService,
    CrudService,
    AuthService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }


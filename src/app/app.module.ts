import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { IonicModule } from '@ionic/angular';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { MatSnackBarModule, MAT_SNACK_BAR_DEFAULT_OPTIONS } from '@angular/material/snack-bar';
import { PublicClientApplication, InteractionType } from '@azure/msal-browser';
import { MsalGuard, MsalInterceptor, MsalModule, MsalService } from '@azure/msal-angular';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CommonService } from './services/common/common.service';
import { ApiService } from './services/api/api.service';
import { SyncService } from './services/sync/sync.service';
import { SqlService } from './services/sql/sql.service';
import { CrudService } from './services/crud/crud.service';
import { TestPageComponent } from './test/test-page/test-page.component';
import { LoginComponent } from './login/login.component';
import { StorageService } from './services/storage/storage.service';
import { CommonModule } from '@angular/common';
import { ErrorModalComponent } from './components/error.component';
import { HeaderComponent } from './shared/header/header.component';
import { HomeModule } from './pages/home/home.module';


const isIE = window.navigator.userAgent.indexOf('MSIE ') > -1 || window.navigator.userAgent.indexOf('Trident/') > -1;

@NgModule({
  declarations: [
    AppComponent,
    TestPageComponent,
    LoginComponent,
    ErrorModalComponent,
    HeaderComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    MatSnackBarModule,
    HttpClientModule,
    HomeModule,
    NgbModule,
    CommonModule,
    MsalModule.forRoot(new PublicClientApplication({
      auth: {
        clientId: '1123627a-6283-4c6e-bdf3-394167cd2e84',
        authority: 'https://login.microsoftonline.com/organizations',
        redirectUri: 'capacitor-electron://login'
      },
      cache: {
        cacheLocation: 'localStorage',
        storeAuthStateInCookie: isIE,
      }
    }), {
      interactionType: InteractionType.Redirect,
      authRequest: {scopes: ['user.read']}
    }, {
      interactionType: InteractionType.Redirect,
      protectedResourceMap: new Map([])
    }),
    IonicModule.forRoot({mode:'md'}),
    
  ],
  providers: [
    CommonService,
    ApiService,
    SyncService,
    SqlService,
    CrudService,
    MsalService,
    StorageService,
    {
      provide: MAT_SNACK_BAR_DEFAULT_OPTIONS, 
      useValue: {duration: 2500}
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: MsalInterceptor,
      multi: true
    },
    MsalGuard
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }


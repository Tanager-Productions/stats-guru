import 'hammerjs';
import { importProvidersFrom } from '@angular/core';
import { AppComponent } from './app/app.component';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { BrowserModule, HammerModule, bootstrapApplication } from '@angular/platform-browser';
import { AgGridModule } from 'ag-grid-angular';
import { AuthService } from './app/services/auth/auth.service';
import { SqlService } from './app/services/sql/sql.service';
import { SyncService } from './app/services/sync/sync.service';
import { ApiService } from './app/services/api/api.service';
import { CommonService } from './app/services/common/common.service';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';

bootstrapApplication(AppComponent, {
	providers: [
		importProvidersFrom(AgGridModule, BrowserModule, CommonModule, IonicModule.forRoot({ mode: 'md' }), HammerModule),
		CommonService,
		ApiService,
		SyncService,
		SqlService,
		AuthService,
		provideRouter(routes)
	]
}).catch(err => console.error(err));



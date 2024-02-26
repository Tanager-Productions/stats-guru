import { importProvidersFrom } from '@angular/core';
import { AppComponent } from './app/app.component';
import { IonicModule } from '@ionic/angular';
import { BrowserModule, HammerModule, bootstrapApplication } from '@angular/platform-browser';
import { AgGridModule } from 'ag-grid-angular';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';
import 'hammerjs';

bootstrapApplication(AppComponent, {
	providers: [
		importProvidersFrom(AgGridModule, BrowserModule, IonicModule.forRoot({ mode: 'md' }), HammerModule),
		provideRouter(routes)
	]
}).catch(err => console.error(err));



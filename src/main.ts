import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { appIntercptors } from './app/app.interceptors';
import { AppComponent } from './app/app.component';
import { IonicModule } from '@ionic/angular';
import { HammerModule, bootstrapApplication } from '@angular/platform-browser';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { routes } from './app/app.routes';
import 'hammerjs';

const config: ApplicationConfig = {
	providers: [
		provideZoneChangeDetection({ eventCoalescing: true }),
		importProvidersFrom(IonicModule.forRoot({ mode: 'md' }), HammerModule),
		provideRouter(routes, withComponentInputBinding()),
		provideHttpClient(withInterceptors(appIntercptors), withFetch())
	]
}

bootstrapApplication(AppComponent, config)
	.catch(err => console.error(err));

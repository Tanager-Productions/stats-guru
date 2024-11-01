import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { appIntercptors } from './app/app.interceptors';
import { AppComponent } from './app/app.component';
import { IonicModule } from '@ionic/angular';
import { HammerModule, bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';
import 'hammerjs';

const config: ApplicationConfig = {
	providers: [
		importProvidersFrom(IonicModule.forRoot({ mode: 'md' }), HammerModule),
		provideRouter(routes),
		provideHttpClient(withInterceptors(appIntercptors), withFetch())
	]
}

bootstrapApplication(AppComponent, config)
	.catch(err => console.error(err));

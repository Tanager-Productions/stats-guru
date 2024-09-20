import { Component, inject } from '@angular/core';
import { ToastController, IonicModule } from '@ionic/angular';
import { ApiService, Credentials } from '../../services/api/api.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';
import { lastValueFrom } from 'rxjs';
import { HeaderComponent } from 'src/app/shared/header/header.component';

@Component({
	selector: 'app-login',
	templateUrl: './login.page.html',
	styleUrls: ['./login.page.scss'],
	standalone: true,
	imports: [IonicModule, NgIf, FormsModule, HeaderComponent],
	host: { class: 'page' }
})
export class LoginPage {
	private server = inject(ApiService);
	private toastCtrl = inject(ToastController);
	private router = inject(Router);
	loading = false;
	key = "";
	checkingForKey = true;

	async register() {
		this.loading = true;
		try {
			await lastValueFrom(this.server.auth.generateApiToken(this.key))
			this.server.auth.storeCredential(Credentials.ApplicationKey, this.key);
			this.router.navigateByUrl('/home');
		} catch (error) {
			(await this.toastCtrl.create({ message: 'Invalid Application Key', color: 'danger', duration: 2500 })).present();
		}
		this.loading = false;
	}
}

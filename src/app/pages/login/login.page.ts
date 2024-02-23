import { Component, inject } from '@angular/core';
import { ToastController, IonicModule } from '@ionic/angular';
import { AuthService, Credentials } from '../../services/auth/auth.service';
import { ApiService } from '../../services/api/api.service';
import { Router } from '@angular/router';
import { SyncService } from 'src/app/services/sync/sync.service';
import { FormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';

@Component({
	selector: 'app-login',
	templateUrl: './login.page.html',
	styleUrls: ['./login.page.scss'],
	standalone: true,
	imports: [IonicModule, NgIf, FormsModule]
})
export class LoginPage {
	private server = inject(ApiService);
	private toastCtrl = inject(ToastController);
	private authService = inject(AuthService);
	private router = inject(Router);
	private sync = inject(SyncService);
  loading:boolean = false;
  key:string = "";
  checkingForKey = true;

	async ngOnInit() {
		let user = this.authService.getUser();
    if (user != null) {
			try {
				let debugResponse = await this.server.debug();
				if (debugResponse.status == 200) {
					this.sync.online = true;
					let userId = user.userId;
					let res = this.authService.getCredential(Credentials.Token);
					if (res != null) {
						let httpResponse = await this.server.getUser(res);
						if (httpResponse.status == 200) {
							this.authService.showPopover = true;
							this.router.navigateByUrl('/home');
						} else {
							//token could have expired, so generate a new one
							let apiKey = this.authService.getCredential(Credentials.Key);
							if (apiKey != null) {
								httpResponse = await this.server.generateToken(apiKey, userId);
								if (httpResponse.status == 200) {
									let newToken = httpResponse.data;
									this.authService.storeCredential(Credentials.Token, newToken);
									this.authService.showPopover = true;
									this.router.navigateByUrl('/home');
								}
							}
						}
					}
					this.checkingForKey = false;
				} else {
					this.authService.showPopover = true;
					this.router.navigateByUrl('/home');
				}
			} catch {
				this.authService.showPopover = true;
				this.router.navigateByUrl('/home');
			}
    }
		this.checkingForKey = false;
	}

  async register() {
    this.loading = true;
    let split = this.key.split(':');
    let adminId = split[0];
    let apiKey = split[1];
    let res = await this.server.verifyApiKey(apiKey, adminId);
    if (res.status == 200) {
      this.authService.storeCredential(Credentials.Key, apiKey);
      res = await this.server.generateToken(apiKey, adminId);
      let token = res.data;
      this.authService.storeCredential(Credentials.Token, token);
      res = await this.server.getUser(token)
      this.authService.storeUser(res.data);
			this.authService.showPopover = true;
      this.router.navigateByUrl('/home');
    } else {
      (await this.toastCtrl.create({message: res.data, color: 'danger', duration: 2500})).present();
    }
    this.loading = false;
  }
}

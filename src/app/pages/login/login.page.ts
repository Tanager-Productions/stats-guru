import { Component } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { AuthService, Credentials } from '../../services/auth/auth.service';
import { ApiService } from '../../services/api/api.service';
import { Router } from '@angular/router';
import { SyncService } from 'src/app/services/sync/sync.service';


@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss']
})
export class LoginPage {
  loading:boolean = false;
  key:string = "";
  checkingForKey = true;

  constructor(
    private server: ApiService,
    private toastCtrl: ToastController,
    private authService: AuthService,
    private router: Router,
		private sync: SyncService
  ) {}

	async ngOnInit() {
		let user = this.authService.getUser();
    if (user != null) {
			let debugResponse = await this.server.Debug();
			if (debugResponse.status == 200) {
				this.sync.online = true;
				let userId = user.userId;
				let res = await this.authService.getCredential(Credentials.Token, userId);
				if (res != null) {
					let httpResponse = await this.server.GetUser(res);
					if (httpResponse.status == 200) {
						this.authService.showPopover = true;
						this.router.navigateByUrl('/home');
					} else {
						//token could have expired, so generate a new one
						let apiKey = await this.authService.getCredential(Credentials.Key, userId);
						if (apiKey != null) {
							httpResponse = await this.server.GenerateToken(apiKey, userId);
							if (httpResponse.status == 200) {
								let newToken = httpResponse.data;
								await this.authService.storeCredential(Credentials.Token, userId, newToken);
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
    }
		this.checkingForKey = false;
	}

  open() {
    // @ts-ignore
    window.StatsGuru.openExternal("https://dbm.thegrindsession.com");
  }

  async register() {
    this.loading = true;
    let split = this.key.split(':');
    let adminId = split[0];
    let apiKey = split[1];
    let res = await this.server.VerifyApiKey(apiKey, adminId);
    if (res.status == 200) {
      await this.authService.storeCredential(Credentials.Key, adminId, apiKey);
      res = await this.server.GenerateToken(apiKey, adminId);
      let token = res.data;
      await this.authService.storeCredential(Credentials.Token, adminId, token);
      res = await this.server.GetUser(token)
      this.authService.storeUser(res.data);
      this.authService.showPopover = true;
      this.router.navigateByUrl('/home');
    } else if (res.status == 400) {
      (await this.toastCtrl.create({message: 'Invalid Key', color: 'danger', duration: 2500})).present();
    } else {
      (await this.toastCtrl.create({message: res.data, color: 'danger', duration: 2500})).present();
    }
    this.loading = false;
  }
}

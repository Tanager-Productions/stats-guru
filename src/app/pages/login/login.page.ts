import { Component } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { StorageService } from '../../services/storage/storage.service';
import { ApiService } from '../../services/api/api.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss']
})
export class LoginPage {
  loading:boolean = false;
  key:string = "";

  constructor(
    private server: ApiService,
    private toastCtrl: ToastController,
    private storageService: StorageService,
    private router: Router
  ) {

  }

  async test() {
    // @ts-ignore
    await window.CapacitorCustomPlatform.setPassword("Stats Guru", "peterg", "TestPassword00");

    // @ts-ignore
    let res = await window.CapacitorCustomPlatform.getPassword("Stats Guru", "peterg");
    console.log(res);
  }

  open() {
    // @ts-ignore
    window.CapacitorCustomPlatform.openExternal("https://dbm.thegrindsession.com");
  }

  async register() {
    this.loading = true;
    let split = this.key.split(':');
    let adminId = split[0];
    let apiKey = split[1];
    let res = await this.server.VerifyApiKey(apiKey, adminId);
    if (res.status == 200) {
      // @ts-ignore
      await window.CapacitorCustomPlatform.setPassword("statsGuruKey", adminId, apiKey);
      res = await this.server.GenerateToken(apiKey, adminId);
      let token = res.data;
      // @ts-ignore
      await window.CapacitorCustomPlatform.setPassword("statsGuruToken", adminId, token);
      res = await this.server.GetUser(token)
      this.storageService.storeUser(res.data);
      this.router.navigateByUrl('/home');
    } else if (res.status == 400) {
      (await this.toastCtrl.create({message: 'Invalid Key', color: 'danger', duration: 2500})).present();
    } else {
      (await this.toastCtrl.create({message: res.data, color: 'danger', duration: 2500})).present();
    }
    this.loading = false;
  }

}

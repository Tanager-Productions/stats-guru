import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MsalService } from '@azure/msal-angular';
import { ToastController } from '@ionic/angular';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { StorageService } from '../services/storage/storage.service';
import { ApiService } from '../services/api/api.service';
import { ErrorModalComponent } from '../components/error.component';
import { Admin } from '../types/admin.type';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {

  adminName:String = "";
  loading:boolean = false;

  constructor(
    private server: ApiService, 
    private msal: MsalService, 
    private router: Router, 
    private toastCtrl: ToastController, 
    private modalService: NgbModal,
    private storageService: StorageService 
  ) {
    this.server.getAdmin().subscribe({
      next: (admin:Admin) => this.adminName = admin.name,
      error: (error) => this.router.navigateByUrl('/')
    });
  }

  login() {
    this.loading = true;
    this.msal.loginPopup().subscribe({
      next: (res) => {
        this.server.verifyAdmin(res.accessToken, res.account?.username, res.account?.name).subscribe({
          next: (admin) => {
            this.router.navigateByUrl('/home');
            this.adminName = admin.name;
            this.loading = false;
            const userDto = {
              MicrosoftAccessToken: res.accessToken,
              Email: res.account?.username,
              FullName: res.account?.name
            };
            this.storageService.storeUser(userDto); 
          },
          error: async (error) => {
            await this.openToast('An error occurred on the server', true, error);
            this.loading = false;
          }
        });
      },
      error: async (error) => {
        console.error(error);
        await this.openToast('An error occurred with microsoft', true, error);
        this.loading = false;
      }
    });
  }
  routeEquals(url:string = '') {
    url = `/${url}`;
    return this.router.url == url;
  }

  routeContains(url:string = '') {
    return this.router.url.includes(url);
  }

  logOut() {
    this.server.logOut().subscribe({
      next: (res) => {
        this.router.navigateByUrl('/');
      }
    });
  }

  async openToast(message: string, isError = false, error?: any) {  
    const toast = await this.toastCtrl.create({
      message: message,   
      duration: 4000,
      color: isError ? 'danger' : 'primary'
    });  
    if (isError) {
      toast.buttons = [{
        text: "Error info",
        side: 'end',
        handler: () => {
          const modalRef = this.modalService.open(ErrorModalComponent);
          modalRef.componentInstance.error = error?.error;
        }
      }]
    }
    toast.present();  
  } 
  
}
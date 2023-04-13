import { Component, Input } from "@angular/core";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { Clipboard } from '@angular/cdk/clipboard';
import { ToastController } from "@ionic/angular";

@Component({
  selector: 'error-modal',
  template: `
    <div class="modal-header">
      <h4 class="modal-title">Server Error</h4>
      <button type="button" class="btn-close" aria-label="Close" (click)="activeModal.dismiss('Cross click')"></button>
    </div>
    <div class="modal-body">
      <p #text>{{error}}</p>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-outline-dark" (click)="copyText(text.textContent)">Copy</button>
    </div>
  `
})
export class ErrorModalComponent {
  @Input() error:any;

  constructor(public activeModal: NgbActiveModal, private clipboard: Clipboard, private toastCtrl: ToastController) {}

  public copyText(text:any) {
    if (this.clipboard.copy(text))
      this.openToast('Copied to clipboard!');
    else
      this.openToast('Failed to copy to clipboard.', true);
  }

  async openToast(message: string, isError = false) {  
    const toast = await this.toastCtrl.create({
      message: message,   
      duration: 4000,
      color: isError ? 'danger' : 'primary'
    });  
    toast.present();  
  } 
}
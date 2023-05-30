import { Component, Input, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { PopoverController } from '@ionic/angular';
import { finalize, map, repeat, takeWhile, tap, timer } from 'rxjs';
import { AppRoutingModule } from 'src/app/app-routing.module';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  isWin: boolean;
  public seconds = 10;
  public isModalOpen = false;
  @Input() showPopover = false;

  constructor(
    private router: Router,
    private popoverController: PopoverController
  ) {
    // @ts-ignore
    this.isWin = window.StatsGuru.isWin;
  }

  close() {
    // @ts-ignore
    window.StatsGuru.close();
  }

  maximize() {
    // @ts-ignore
    window.StatsGuru.maximize();
  }

  minimize() {
    // @ts-ignore
    window.StatsGuru.minimize();
  }

  timeRemaining$ = timer(0, 1000).pipe(
    map(n => (this.seconds - n) * 1000),
    takeWhile(n => n >= 0),
    finalize(() => {
      console.log('Sync finished.')
    }),
    repeat()
  );

  navigateToDBM(): void {
    // @ts-ignore
    window.StatsGuru.openExternal("https://dbm.thegrindsession.com");
  }

  navigateToLogin(): void {
    this.router.navigate(['/login']);
    this.popoverController.dismiss();
  }

  startSync(): void {
    this.timeRemaining$ = timer(0, 1000).pipe(
      map(n => (this.seconds - n) * 1000),
      takeWhile(n => n >= 0),
      finalize(() => {
        console.log('Sync finished.')
      }),
      repeat()
    );
  }

  setOpen(isOpen: boolean) {
    this.isModalOpen = isOpen;
  }

}

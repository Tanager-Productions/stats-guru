import { Component, Input, ViewChild } from '@angular/core';
import { finalize, map, repeat, takeWhile, tap, timer } from 'rxjs';

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

  constructor() {
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

  // setPopover (showPopover: boolean) {
  //   return showPopover;
  // }

  setOpen(isOpen: boolean) {
    this.isModalOpen = isOpen;
  }

}

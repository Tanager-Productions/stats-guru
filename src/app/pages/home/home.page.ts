import { Component } from '@angular/core';
import { finalize, map, repeat, takeWhile, tap, timer } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})

export class HomePage {

  public seconds = 10;
  public isModalOpen = false;
  
  constructor() {}

  timeRemaining$ = timer(0, 1000).pipe(
    map(n => (this.seconds - n) * 1000),
    takeWhile(n => n >= 0),
    finalize(() => {
      console.log('Sync finished.')
    }),
    repeat()
  );

  navigateToDBM(): void {
    //shell.openExternal("https://dbm.thegrindsession.com/");
    console.log("This takes you to the DBM website.");
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

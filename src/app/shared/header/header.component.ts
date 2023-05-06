import { Component } from '@angular/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  isWin:boolean;

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
}

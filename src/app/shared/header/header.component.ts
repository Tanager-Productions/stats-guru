import { Component, Input, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Account } from 'src/app/types/account';
import { AuthService } from 'src/app/services/auth/auth.service';
import { SyncService } from 'src/app/services/sync/sync.service';
import { ColDef } from 'ag-grid-community';
import { appWindow } from '@tauri-apps/api/window'
import { os, window } from '@tauri-apps/api';
import { DatePipe, NgIf, NgTemplateOutlet } from "@angular/common";
import { ValueFormatterParams } from "ag-grid-community";
import { AgGridModule } from 'ag-grid-angular';
import { IonicModule } from '@ionic/angular';
import { SyncHistory } from 'src/app/types/models';
import { database } from 'src/app/app.db';

function getDate(params:ValueFormatterParams) {
  const date:Date = new Date(params.value);
  const datepipe: DatePipe = new DatePipe('en-US');
  return datepipe.transform(date, 'short') ?? "";
}

@Component({
	selector: 'app-header',
	templateUrl: './header.component.html',
	styleUrls: ['./header.component.scss'],
	standalone: true,
	imports: [NgIf, IonicModule, NgTemplateOutlet, AgGridModule, DatePipe]
})
export class HeaderComponent implements OnInit {
	private router = inject(Router);
	private auth = inject(AuthService);
	public sync = inject(SyncService);
  public isWin: boolean = true;
  @Input() showPopover = false;
  public user: Account | null = null;
  public modalOpen:boolean = false;
  public syncHistory?: SyncHistory[];

	//Sync information:
	public syncData: ColDef [] = [
		{field: 'dateOccurred', headerName: 'Date Occurred', width: 200,  pinned: true, valueFormatter: getDate, filter: 'date'},
		{field: 'playsSynced', headerName: 'Plays Synced', cellRenderer: (data: any) => { return (Boolean(data.value))}},
		{field: 'playersSynced', headerName: 'Players Synced', cellRenderer: (data: any) => { return (Boolean(data.value))}},
		{field: 'gamesSynced', headerName: 'Games Synced', cellRenderer: (data: any) => { return (Boolean(data.value))}},
		{field: 'statsSynced', headerName: 'Stats Synced', cellRenderer: (data: any) => { return (Boolean(data.value))}},
		{field: 'errorMessages', headerName: 'Error Messages', cellRenderer: (data: any) => { return data.value === "[]" ? "N/A" : data.value}}
	]

  async ngOnInit() {
    this.user = this.auth.getUser();
		const plat = await os.platform();
		this.isWin = plat == 'win32';
		if (this.isWin) {
			window.appWindow.setDecorations(false);
		}
    this.sync.syncComplete().subscribe(async () => {
			this.syncHistory = await database.syncHistory.toArray();
    })
  }

  close() {
    appWindow.close();
  }

  maximize() {
   appWindow.maximize();
  }

  minimize() {
    appWindow.minimize();
  }

  navigateToLogin() {
		this.auth.removeUser();
		this.user = null;
    this.router.navigate(['/login']);
  }

  startSync() {
    this.sync.setTimer();
  }

}

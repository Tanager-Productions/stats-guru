import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SyncHistory } from 'src/app/interfaces/syncHistory.interface';
import { AccountDto } from 'src/app/interfaces/accountDto.interface';
import { AuthService } from 'src/app/services/auth/auth.service';
import { SqlService } from 'src/app/services/sql/sql.service';
import { SyncService } from 'src/app/services/sync/sync.service';
import { ColDef } from 'ag-grid-community';
import { appWindow } from '@tauri-apps/api/window'
import { os, window } from '@tauri-apps/api';
import { DatePipe } from "@angular/common";
import { ValueFormatterParams } from "ag-grid-community";

function getDate(params:ValueFormatterParams) {
  const date:Date = new Date(params.value);
  const datepipe: DatePipe = new DatePipe('en-US');
  return datepipe.transform(date, 'short') ?? "";
}

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  public isWin: boolean = true;
  @Input() showPopover = false;
  public user:AccountDto | null;
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

  constructor(
    private router: Router,
    auth: AuthService,
    public sync:SyncService,
    private crud:SqlService
  ) {
    this.user = auth.getUser();
    os.platform().then(plat => {
			this.isWin = plat == 'win32';
			if (this.isWin) {
				window.appWindow.setDecorations(false);
			}
		});
  }

  ngOnInit() {
    this.sync.syncComplete().subscribe(async complete => {
      if (complete) {
        this.syncHistory = await this.crud.query({table: "syncHistory", orderByColumn: "dateOccurred", orderDirection: "desc"});
      }
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

  navigateToLogin(): void {
    this.router.navigate(['/login']);
  }

  startSync(): void {
    this.sync.setTimer();
  }

}

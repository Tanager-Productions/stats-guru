import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SyncHistory } from 'src/app/interfaces/syncHistory.interface';
import { AccountDto } from 'src/app/interfaces/accountDto.interface';
import { AuthService } from 'src/app/services/auth/auth.service';
import { CrudService } from 'src/app/services/crud/crud.service';
import { SqlService } from 'src/app/services/sql/sql.service';
import { SyncService } from 'src/app/services/sync/sync.service';
import { ColDef } from 'ag-grid-community';
import { appWindow } from '@tauri-apps/api/window'

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  public isWin: boolean;
  @Input() showPopover = false;
  public user:AccountDto | null;
  public modalOpen:boolean = false;
  public syncHistory?: SyncHistory[];

	//Sync information:
	public syncData: ColDef [] = [
		{field: 'dateOccurred', headerName: 'Date Occurred', width: 200,  pinned: true, cellRenderer: (data: any) => {
			return data.value ? (new Date(data.value)).toLocaleString('en-GB', { timeZone: 'UTC' }) : '';}},
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
    private sql:SqlService,
    private crud:CrudService
  ) {
    this.user = auth.getUser();
    this.isWin = false
  }

  ngOnInit() {
    this.sync.syncComplete().subscribe(async complete => {
      if (complete) {
        this.syncHistory = await this.crud.query("syncHistory", undefined, "dateOccurred", "desc");
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

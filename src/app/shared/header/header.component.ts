import { Component, Input, OnInit, inject, input } from '@angular/core';
import { Router } from '@angular/router';
import { SyncService } from 'src/app/services/sync/sync.service';
import { ColDef } from 'ag-grid-community';
import { appWindow } from '@tauri-apps/api/window'
import { os, window } from '@tauri-apps/api';
import { DatePipe, NgIf, NgTemplateOutlet } from "@angular/common";
import { ValueFormatterParams } from "ag-grid-community";
import { AgGridModule } from 'ag-grid-angular';
import { IonicModule } from '@ionic/angular';
import { database } from 'src/app/app.db';
import { ApiService, Credentials } from 'src/app/services/api/api.service';

function getDate(params: ValueFormatterParams) {
	const date = new Date(params.value);
	const datepipe = new DatePipe('en-US');
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
	protected server = inject(ApiService);
	public sync = inject(SyncService);
	public showPopover = input(true);
	public isWin = true;
	public modalOpen = false;

	async ngOnInit() {
		const plat = await os.platform();
		this.isWin = plat == 'win32';
		if (this.isWin) {
			window.appWindow.setDecorations(false);
		}
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
		this.server.auth.storeCredential(Credentials.ApplicationKey, '');
		this.router.navigate(['/login']);
	}

	startSync() {
		this.sync.setTimer();
	}
}

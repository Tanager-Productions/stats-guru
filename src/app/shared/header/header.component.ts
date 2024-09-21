import { ChangeDetectionStrategy, Component, OnInit, computed, inject, input, signal } from '@angular/core';
import { Router } from '@angular/router';
import { SyncService } from 'src/app/services/sync/sync.service';
import { appWindow } from '@tauri-apps/api/window'
import { os, window } from '@tauri-apps/api';
import { DatePipe, NgClass, NgTemplateOutlet } from "@angular/common";
import { AgGridModule } from 'ag-grid-angular';
import { IonicModule } from '@ionic/angular';
import { ApiService, Credentials } from 'src/app/services/api/api.service';

@Component({
	selector: 'app-header',
	templateUrl: './header.component.html',
	styleUrls: ['./header.component.scss'],
	standalone: true,
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [IonicModule, NgTemplateOutlet, AgGridModule, DatePipe, NgClass]
})
export class HeaderComponent implements OnInit {
	private router = inject(Router);
	protected server = inject(ApiService);
	public sync = inject(SyncService);
	public showPopover = input(true);
	public isWin = signal<boolean | null>(null);

	protected username = computed(() => {
		const user = this.server.user();
		return user ? user.full_name || user.email : 'USER NOT FOUND';
	})

	async ngOnInit() {
		const plat = await os.platform();
		this.isWin.set(plat == 'win32')
		if (this.isWin() === true) {
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

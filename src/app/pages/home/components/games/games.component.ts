import { ChangeDetectionStrategy, Component, effect, inject, untracked, viewChild } from '@angular/core';
import { CommonService, HomePageGame } from 'src/app/services/common/common.service';
import { SyncService } from 'src/app/services/sync/sync.service';
import { RouterLink } from '@angular/router';
import { Router } from '@angular/router';
import { AddGamesComponent } from '../../../../shared/add-games/add-games.component';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AlertController, IonicModule, ToastController } from '@ionic/angular';
import { AgGridAngular, AgGridModule } from 'ag-grid-angular';
import { ColDef } from 'ag-grid-community';
import { toSignal } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged, fromEvent } from 'rxjs';
import { ApiService } from 'src/app/services/api/api.service';
import { HeaderComponent } from 'src/app/shared/header/header.component';
import { checkUpdate, installUpdate, onUpdaterEvent } from '@tauri-apps/api/updater'
import { relaunch } from '@tauri-apps/api/process'
import { environment } from 'src/environments/environment';

@Component({
	selector: 'app-games',
	templateUrl: './games.component.html',
	styleUrls: ['./games.component.scss'],
	standalone: true,
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [
		IonicModule,
		FormsModule,
		AddGamesComponent,
		RouterLink,
		DatePipe,
		AgGridModule,
		HeaderComponent
	],
	host: { class: 'page' }
})
export class GamesComponent {
	private alertController = inject(AlertController);
	private toastController = inject(ToastController);
	private server = inject(ApiService);
	private sync = inject(SyncService);
	public common = inject(CommonService);
	private router = inject(Router);
	public grid = viewChild(AgGridAngular);
	private unlisten?: () => void;
	public gameStats: ColDef<HomePageGame>[] = [
		{ field: 'gameDay', headerName: 'Day' },
		{ field: 'gameTime', headerName: 'Time' },
		{ field: 'gameDate', headerName: 'Date' },
		{ field: 'homeTeamName', headerName: 'Home Team' },
		{ field: 'homeTeamScore', headerName: 'Home Final' },
		{ field: 'awayTeamName', headerName: 'Away Team' },
		{ field: 'awayTeamScore', headerName: 'Away Final' },
		{ field: 'eventTitle', headerName: 'Event', valueFormatter: params => params.value || '-' }
	]

	public windowResize = toSignal(fromEvent(window, 'resize').pipe(
		debounceTime(200),
		distinctUntilChanged()
	));

	private windowResizeEffect = effect(() => {
		this.windowResize();
		const grid = untracked(this.grid);
		grid?.api.sizeColumnsToFit();
	})

	ngAfterViewInit() {
		if (this.server.isOnline()) {
			this.syncAndUpdate();
		} else {
			this.common.initializeService();
		}
	}

	ngOnDestroy() {
		if (this.unlisten) this.unlisten()
	}

	private async syncAndUpdate() {
		try {
			await this.sync.beginSync(true);
		} catch (error) {
			console.log(error);
			const toast = await this.toastController.create({
				message: 'Failed to sync data',
				duration: 3000,
				color: 'danger'
			});
			toast.present();
		}
		if (environment.production) {
			this.unlisten = await onUpdaterEvent(({ error, status }) => {
				console.debug('Updater event', error, status)
			})
			const { shouldUpdate, manifest } = await checkUpdate();
			if (shouldUpdate) {
				const dialog = await this.alertController.create({
					header: 'Update Available',
					message: `Version ${manifest?.version} is available. Do you want to install it?`,
					buttons: [
						{ text: 'No', role: 'cancel' },
						{ text: 'Yes', handler: async () => {
							console.log(`Installing update ${manifest?.version}, ${manifest?.date}, ${manifest?.body}`)
							await installUpdate();
							await relaunch();
						}}
					]
				});
				dialog.present();
			}
		}
	}

	public routeToPage(event: any) {
		if (event.node.selected) {
			this.router.navigateByUrl("/home/gamecast/" + event.data.gameId);
		}
	}
}

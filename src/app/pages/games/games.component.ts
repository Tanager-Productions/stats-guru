import { ChangeDetectionStrategy, Component, effect, inject, untracked, viewChild } from '@angular/core';
import { CommonService, HomePageGame } from 'src/app/services/common/common.service';
import { SyncService } from 'src/app/services/sync/sync.service';
import { Router } from '@angular/router';
import { AddGamesComponent } from 'src/app/shared/add-games/add-games.component';
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
import { LoadingController } from '@ionic/angular';

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
		AgGridModule,
		HeaderComponent
	],
	host: { class: 'page' }
})
export class GamesComponent {
	private alertController = inject(AlertController);
	private toastController = inject(ToastController);
	private loadingController = inject(LoadingController);
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
	public isLoading = false;
	public windowResize = toSignal(fromEvent(window, 'resize').pipe(
		debounceTime(200),
		distinctUntilChanged()
	));

	private windowResizeEffect = effect(() => {
		this.windowResize();
		const grid = untracked(this.grid);
		grid?.api?.sizeColumnsToFit();
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

	// async showLoading() {
	// 	// Step 1: Create the loading indicator
	// 	const loading = await this.loadingController.create({
	// 		message: 'Please wait...',   // Message displayed below the spinner
	// 		spinner: 'crescent',         // Style of spinner (crescent, dots, etc.)
	// 		duration: 10000              // Optional: automatically dismiss after 10 seconds
	// 	});

	// 	// Step 2: Present the loading indicator
	// 	await loading.present();

	// 	// (Optional) Check if the loading is presented successfully
	// 	const { role } = await loading.onDidDismiss();
	// 	console.log('Loading dismissed with role:', role);
	// }

	// async performTaskWithLoading() {
	// 	// Step 1: Show the loading indicator
	// 	const loading = await this.loadingController.create({
	// 		message: 'Loading data...',
	// 		spinner: 'bubbles'
	// 	});
	// 	await loading.present(); // Shows the loading indicator

	// 	try {
	// 		// Step 2: Perform your async task here
	// 		await this.someAsyncOperation();
	// 	} catch (error) {
	// 		console.error('Error occurred:', error);
	// 	} finally {
	// 		// Step 3: Dismiss the loading indicator when done
	// 		await loading.dismiss();
	// 	}
	// }
	public routeToPage(event: any) {
		if (event.node.selected) {
			this.router.navigateByUrl("/games/" + event.data.gameId);
		}
	}
}

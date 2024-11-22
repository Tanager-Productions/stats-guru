import { Injectable, inject, signal } from '@angular/core';
import { ApiService } from '../api/api.service';
import { BehaviorSubject, Subscription, filter, finalize, interval, lastValueFrom, map, repeat, takeWhile } from 'rxjs';
import { CommonService } from '../common/common.service';
import { join, appLogDir } from '@tauri-apps/api/path';
import { readTextFile } from '@tauri-apps/api/fs'
import { database } from 'src/app/app.db';
import { SyncState } from 'src/app/app.types';
import { LoadingController } from '@ionic/angular';

@Injectable({
	providedIn: 'root'
})
export class SyncService {
	private api = inject(ApiService);
	private common = inject(CommonService);
	private loadingController = inject(LoadingController);
	private seconds = 600; //10 minutes
	private timeRemaining$ = interval(1000).pipe(
		map(n => (this.seconds - n) * 1000),
		takeWhile(n => n >= 0),
		finalize(async () => {
			if (this.gameCastInProgress == false) {
				await this.beginSync();
			}
		}),
		repeat()
	);
	private initialSyncComplete = new BehaviorSubject<boolean>(false);
	private timerSubscription?: Subscription;
	public gameCastInProgress = false;
	public timeRemaining = signal<number | null>(null);
	public syncing = signal(false);
	public syncingMessage = signal('');

	public async beginSync(isInitial = false) {
		if (this.gameCastInProgress == false && this.syncing() == false) {
			const loading = await this.loadingController.create({
				message: 'Please wait...'
			});
			loading.present();
			this.syncing.set(true);
			this.syncingMessage.set('Syncing with server...');
			try {
				const data = await database.getSyncTables();
				await lastValueFrom(this.api.data.sync(data));
				const tablesToClear = database.tables.filter(t => t.name !== 'syncHistory')
				for (let table of tablesToClear) {
					await table.clear();
				}
				await this.getData();
			} catch (error) {
				console.log(error);
			}
			this.syncingMessage.set('');
			if (isInitial) {
				this.initialSyncComplete.next(true);
				this.setTimer();
			}
			this.syncing.set(false);
			this.common.initializeService();
			loading.dismiss();
		}
	}

	public async sendLogsToServer(gameId: number) {
		const dir = await appLogDir();
		const filePath = await join(dir, 'Stats Guru.log');
		const langDe = await readTextFile(filePath);
		var blob = new Blob([langDe], { type: 'text/plain' });
		var file = new File([blob], `${new Date().toJSON()}_log.txt`, { type: "text/plain" });
		const formData = new FormData();
		formData.append("logFile", file);
		formData.append("gameId", gameId.toString());
		this.api.data.addLog(formData);
	}

	public syncComplete() {
		return this.initialSyncComplete.pipe(filter(t => t === true));
	}

	public setTimer() {
		if (this.timerSubscription) {
			this.timerSubscription.unsubscribe();
		}
		this.timerSubscription = this.timeRemaining$.subscribe(t => this.timeRemaining.set(t));
	}

	private async getData() {
		this.syncingMessage.set('Fetching data from server...');
		const response = (await lastValueFrom(this.api.data.getCurrentSeason()))[0];
		await database.transaction('rw', [
			'seasons',
			'teams',
			'events',
			'players',
			'games',
			'plays',
			'stats'
		], () => {
			this.syncingMessage.set('Adding latest season...');
			database.seasons.add({
				year: response.year,
				conferences: response.conferences,
				created_on: response.created_on
			});

			this.syncingMessage.set('Adding teams...');
			database.teams.bulkAdd(response.teams);

			this.syncingMessage.set('Adding events...');
			database.events.bulkAdd(response.events);

			this.syncingMessage.set('Adding players...');
			database.players.bulkAdd(response.players.map(t => ({ ...t, sync_state: SyncState.Unchanged })));

			this.syncingMessage.set('Adding games...');
			database.games.bulkAdd(response.games.map(t => ({ ...t, sync_state: SyncState.Unchanged })));

			this.syncingMessage.set('Adding plays...');
			database.plays.bulkAdd(response.games.flatMap(t => t.plays).map(t => ({ ...t, sync_state: SyncState.Unchanged })));

			this.syncingMessage.set('Adding stats...');
			database.stats.bulkAdd(response.games.flatMap(t => t.stats).map(t => ({ ...t, sync_state: SyncState.Unchanged })));
		});
	}
}

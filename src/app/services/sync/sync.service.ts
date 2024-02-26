import { Injectable, inject } from '@angular/core';
import { ApiService } from '../api/api.service';
import { BehaviorSubject, Observable, Subscription, filter, finalize, interval, map, repeat, takeWhile } from 'rxjs';
import { CommonService } from '../common/common.service';
import { DataDto, SyncHistory, mapGameToDto, mapGameToModel, mapPlayToDto, mapPlayToModel, mapPlayerToDto, mapPlayerToModel, mapStatToDto, mapStatToModel } from 'src/app/types/models';
import { join, appLogDir } from '@tauri-apps/api/path';
import { readTextFile } from '@tauri-apps/api/fs'
import { AuthService } from '../auth/auth.service';
import { database } from 'src/app/app.db';
import { SyncDto, SyncMode, SyncResult } from 'src/app/types/sync';

@Injectable({
  providedIn: 'root'
})
export class SyncService {
	private api = inject(ApiService);
	private common = inject(CommonService);
	private authService = inject(AuthService);
  private seconds = 600; //10 minutes
  private timeRemaining$: Observable<number> = interval(1000).pipe(
    map(n => (this.seconds - n) * 1000),
    takeWhile(n => n >= 0),
    finalize(() => {
      if (this.gameCastInProgress == false) {
        this.beginSync();
      }
    }),
    repeat()
  );
  private initialSyncComplete:BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private timerSubscription?:Subscription;
  public timeRemaining?: number;
  public gameCastInProgress:boolean = false;
  public syncing:boolean = false;
	public online:boolean = false;
	public syncingMessage = '';

  public async beginSync(isInitial:boolean = false) {
		if (!this.gameCastInProgress) {
			this.syncing = true;
			this.syncingMessage = 'Syncing with server...';
			try {
				const data = await database.getSyncTables();
				let res: SyncDto = {
					version: database.currentDatabaseVersion,
					mode: SyncMode.Full,
					overwrite: null,
					games: data[0].map(mapGameToDto),
					players: data[1].map(mapPlayerToDto),
					stats: data[2].map(mapStatToDto),
					plays: data[3].map(mapPlayToDto)
				}
				let httpResponse = await this.api.postSync(res);
				if (httpResponse.status == 200) {
					let res: SyncResult = httpResponse.data;
					database.transaction('rw', database.syncHistory, () => {
						database.syncHistory.add({
							id: 0,
							dateOccurred: new Date().toUTCString(),
							statsSynced: res.statsSynced,
							gamesSynced: res.gamesSynced,
							playersSynced: res.playersSynced,
							playsSynced: res.playsSynced,
							errorMessages: res.errorMessages
						});
					});
					if (res.statsSynced && res.playersSynced && res.gamesSynced && res.playsSynced) {
						const tablesToClear = database.tables.filter(t => t.name !== 'syncHistory')
						for (let table of tablesToClear) {
							table.clear();
						}
						await this.getData();
					}
				} else {
					throw "Failed to post sync"
				}
			} catch (error) {
				console.log(error);
			}
			this.syncingMessage = '';
			if (isInitial) {
				this.initialSyncComplete.next(true);
				this.setTimer();
			}
			this.syncing = false;
			this.common.initializeService();
		}
  }

	public async sendLogsToServer(gameId:number) {
		let user = this.authService.getUser();
		const dir = await appLogDir();
		const filePath = await join(dir, 'Stats Guru.log');
		const langDe = await readTextFile(filePath);
		var blob = new Blob([langDe], {type: 'text/plain'});
		var file = new File([blob], `${new Date().toJSON()}_log.txt`, {type: "text/plain"});
		const formData = new FormData();
		formData.append("logFile", file);
		formData.append("gameId", gameId.toString());
		if (user != null) {
			await this.api.postLog(formData, user.userId);
		}
	}

  public syncComplete() {
    return this.initialSyncComplete.pipe(filter(t => t === true));
  }

  public setTimer() {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
    this.timerSubscription = this.timeRemaining$.subscribe(t => this.timeRemaining = t);
  }

  private async getData() {
		this.syncingMessage = 'Fetching data from server...';
    let response = await this.api.getData();

    if (response.status == 200) {
      const {
				seasons,
				teams,
				events,
				players,
				games,
				plays,
				stats
			} = response.data as DataDto;
			await database.transaction('rw', [
				'seasons',
				'teams',
				'events',
				'players',
				'games',
				'plays',
				'stats'
			], () => {
				this.syncingMessage = 'Adding seasons...';
				database.seasons.bulkAdd(seasons);

				this.syncingMessage = 'Adding teams...';
				database.teams.bulkAdd(teams);

				this.syncingMessage = 'Adding events...';
				database.events.bulkAdd(events);

				this.syncingMessage = 'Adding players...';
				database.players.bulkAdd(players.map(mapPlayerToModel));

				this.syncingMessage = 'Adding games...';
				database.games.bulkAdd(games.map(mapGameToModel));

				this.syncingMessage = 'Adding plays...';
				database.plays.bulkAdd(plays.map(mapPlayToModel));

				this.syncingMessage = 'Adding stats...';
				database.stats.bulkAdd(stats.map(mapStatToModel));
			});
    } else {
      throw new Error(`Failed to fetch data from server: ${response.data}`);
    }
  }
}

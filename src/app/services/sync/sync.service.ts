import { Injectable } from '@angular/core';
import { ApiService } from '../api/api.service';
import { SqlService } from '../sql/sql.service';
import { SyncDto, SyncMode } from 'src/app/interfaces/sync.interface';
import { currentDatabaseVersion, databaseName } from 'src/app/upgrades/versions';
import { SyncResult } from 'src/app/interfaces/syncResult.interface';
import { BehaviorSubject, Observable, Subscription, finalize, interval, map, repeat, takeWhile } from 'rxjs';
import { SyncHistory } from 'src/app/interfaces/syncHistory.interface';
import { CommonService } from '../common/common.service';
import { DataDto } from 'src/app/interfaces/dataDto.interface';

@Injectable({
  providedIn: 'root'
})
export class SyncService {
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

  constructor(private api:ApiService, private sqlService:SqlService, private common:CommonService) { }

  public async beginSync(isInitial:boolean = false) {
		if (!this.gameCastInProgress) {
			this.syncing = true;
			this.syncingMessage = 'Syncing with server...';
			try {
				let res: SyncDto = {
					version: currentDatabaseVersion,
					mode: SyncMode.Full,
					overwrite: null,
					games: await this.sqlService.query({table: "games"}),
					players: await this.sqlService.query({table: "players"}),
					stats: await this.sqlService.query({table: "stats"}),
					plays: await this.sqlService.query({table: "plays"})
				}
				let httpResponse = await this.api.postSync(res);
				if (httpResponse.status == 200) {
					let res: SyncResult = httpResponse.data;
					let history: SyncHistory = {
						id: 0,
						dateOccurred: new Date().toUTCString(),
						statsSynced: res.statsSynced,
						gamesSynced: res.gamesSynced,
						playersSynced: res.playersSynced,
						playsSynced: res.playsSynced,
						errorMessages: JSON.stringify(res.errorMessages)
					};
					await this.sqlService.save('syncHistory', history);
					if (history.statsSynced && history.playersSynced && history.gamesSynced && history.playsSynced) {
						await this.sqlService.rawExecute(`
							delete from seasons;
							delete from events;
						`);
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

  public syncComplete() {
    return this.initialSyncComplete.asObservable();
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
      let dto: DataDto = response.data;

			this.syncingMessage = 'Adding seasons...';
			if (dto.seasons.length > 0) {
				await this.sqlService.bulkInsert("seasons", dto.seasons);
			}

			this.syncingMessage = 'Adding teams...';
			if (dto.teams.length > 0) {
				await this.sqlService.bulkInsert("teams", dto.teams);
			}

			this.syncingMessage = 'Adding events...';
			if (dto.events.length > 0) {
				await this.sqlService.bulkInsert("events", dto.events);
			}

			this.syncingMessage = 'Adding players...';
			for (var i = 0; i < dto.players.length; i = i + 250) {
				let end = i + 250;
				if (end > dto.players.length) {
					end = dto.players.length;
				}
				await this.sqlService.bulkInsert("players", dto.players.slice(i, end));
			}

			this.syncingMessage = 'Adding games...';
			for (var i = 0; i < dto.games.length; i = i + 250) {
				let end = i + 250;
				if (end > dto.games.length) {
					end = dto.games.length;
				}
				await this.sqlService.bulkInsert("games", dto.games.slice(i, end));
			}

			this.syncingMessage = 'Adding plays...';
			for (var i = 0; i < dto.plays.length; i = i + 250) {
				let end = i + 250;
				if (end > dto.plays.length) {
					end = dto.plays.length;
				}
				await this.sqlService.bulkInsert("plays", dto.plays.slice(i, end));
			}

			this.syncingMessage = 'Adding stats...';
			for (var i = 0; i < dto.stats.length; i = i + 250) {
				let end = i + 250;
				if (end > dto.stats.length) {
					end = dto.stats.length;
				}
				await this.sqlService.bulkInsert("stats", dto.stats.slice(i, end));
			}
    } else {
      throw new Error(`Failed to fetch data from server: ${response.data}`);
    }
  }
}

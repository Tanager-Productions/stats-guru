import { Injectable } from '@angular/core';
import { ApiService } from '../api/api.service';
import { SqlService } from '../sql/sql.service';
import { CrudService } from '../crud/crud.service';
import { SyncDto, SyncMode } from 'src/app/interfaces/sync.interface';
import { currentDatabaseVersion } from 'src/app/upgrades/versions';
import { SQLiteDBConnection } from '@capacitor-community/sqlite';
import { SyncResult } from 'src/app/interfaces/syncResult.interface';
import { BehaviorSubject, Observable, Subscription, finalize, interval, map, repeat, takeWhile } from 'rxjs';
import { SyncHistory } from 'src/app/interfaces/syncHistory.interface';
import { ServerGame } from 'src/app/interfaces/game.interface';
import { ServerEvent } from 'src/app/interfaces/event.interface';
import { ServerPlay } from 'src/app/interfaces/play.interface';
import { ServerPlayer } from 'src/app/interfaces/player.interface';
import { ServerStat } from 'src/app/interfaces/stat.interface';
import { ServerTeam } from 'src/app/interfaces/team.interface';
import { CommonService } from '../common/common.service';

@Injectable({
  providedIn: 'root'
})
export class SyncService {
  private db?:SQLiteDBConnection;
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

  constructor(private api:ApiService, private sqlService:SqlService, private crudService:CrudService, private common:CommonService) { }

  public async beginSync(isInitial:boolean = false) {
		if (!this.gameCastInProgress) {
			this.db = await this.sqlService.createConnection();
			this.syncing = true;
			try {
				let res: SyncDto = {
					version: currentDatabaseVersion,
					mode: SyncMode.Full,
					overwrite: null,
					games: await this.crudService.query(this.db, "Games"),
					players: await this.crudService.query(this.db, "Players"),
					stats: await this.crudService.query(this.db, "Stats"),
					plays: await this.crudService.query(this.db, "Plays")
				}
				let httpResponse = await this.api.postSync(res);
				if (httpResponse.status == 200) {
					let res: SyncResult = httpResponse.data;
					let history: SyncHistory = {
						id: 0,
						dateOccurred: new Date().toUTCString(),
						statsSynced: res.statsSynced ? 1 : 0,
						gamesSynced: res.statsSynced ? 1 : 0,
						playersSynced: res.statsSynced ? 1 : 0,
						playsSynced: res.statsSynced ? 1 : 0,
						errorMessages: JSON.stringify(res.errorMessages)
					};
					await this.crudService.save(this.db, 'SyncHistory', history);
					await this.db.execute(` delete from plays;
																	delete from stats;
																	delete from games;
																	delete from players;
																	delete from teams;
																	delete from events;`, true);
					await this.getData();
				} else {
					throw "Failed to post sync"
				}
			} catch (error) {
				console.log(error);
			}
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
    await this.fetchAndInsertTeams();
    await this.fetchAndInsertPlayers();
    await this.fetchAndInsertEvents();
    await this.fetchAndInsertGames();
    await this.fetchAndInsertStats();
    await this.fetchAndInsertPlays();
  }

  private async fetchAndInsertGames() {
    let response = await this.api.getAllGames();
    if (response.status == 200) {
      let games = response.data /*as ServerGame[]*/;
      for (let game of games) {
        delete game.homeFinal;
        delete game.awayFinal;
      }
      await this.crudService.bulkInsert(this.db!, "games", games);
    } else {
      throw new Error(`Failed to fetch games from server: ${response.data}`);
    }
  }

  private async fetchAndInsertEvents() {
    let response = await this.api.getAllEvents();
    if (response.status == 200) {
      let events = response.data as ServerEvent[];
      if (events.length > 0)
        await this.crudService.bulkInsert(this.db!, "events", events);
    } else {
      throw new Error(`Failed to fetch games from server: ${response.data}`);
    }
  }

  private async fetchAndInsertPlayers() {
    let response = await this.api.getAllPlayers();
    if (response.status == 200) {
      let players = response.data /*as ServerPlayer[]*/;
			for (let player of players) {
				delete player.socialMedias;
			}
      if (players.length > 0)
        await this.crudService.bulkInsert(this.db!, "players", players);
    } else {
      throw new Error(`Failed to fetch games from server: ${response.data}`);
    }
  }

  private async fetchAndInsertTeams() {
    let response = await this.api.getAllTeams(true);
    if (response.status == 200) {
      let teams = response.data as ServerTeam[];
      if (teams.length > 0)
        await this.crudService.bulkInsert(this.db!, "teams", teams);
    } else {
      throw new Error(`Failed to fetch games from server: ${response.data}`);
    }
  }

  private async fetchAndInsertStats() {
    let response = await this.api.getAllStats();
    if (response.status == 200) {
      let stats = response.data /*as ServerStat[]*/;
      for (let stat of stats) {
        delete stat.points;
        delete stat.eff;
				delete stat.rebounds;
      }
      for (var i = 0; i < stats.length; i = i + 200) {
        let end = i+200;
        if (end > stats.length) {
          end = stats.length;
        }
        await this.crudService.bulkInsert(this.db!, "stats", stats.slice(i, end));
      }
    } else {
      throw new Error(`Failed to fetch games from server: ${response.data}`);
    }
  }

  private async fetchAndInsertPlays() {
    let response = await this.api.getAllPlays();
    if (response.status == 200) {
      let plays = response.data as ServerPlay[];
      for (var i = 0; i < plays.length; i = i + 200) {
        let end = i+200;
        if (end > plays.length) {
          end = plays.length;
        }
        await this.crudService.bulkInsert(this.db!, "plays", plays.slice(i, end));
      }
    } else {
      throw new Error(`Failed to fetch games from server: ${response.data}`);
    }
  }
}

import { Injectable } from '@angular/core';
import { currentDatabaseVersion, databaseName, upgrades } from 'src/app/upgrades/versions';
import { BehaviorSubject } from 'rxjs';
import Database from "tauri-plugin-sql-api";
import { SyncHistory } from 'src/app/interfaces/syncHistory.interface';
import { Play, Player, Game, Stat } from 'src/app/interfaces/models';
import { appDataDir } from '@tauri-apps/api/path';
import { GamesRepository } from './repositories/games.repository';
import { EventsRepository } from './repositories/events.repository';
import { PlayersRepository } from './repositories/players.repository';
import { PlaysRepository } from './repositories/plays.repository';
import { SeasonsRepository } from './repositories/seasons.repository';
import { StatsRepository } from './repositories/stats.repository';
import { SyncRepository } from './repositories/sync.repository';
import { TeamsRepository } from './repositories/teams.repository';

export type Table = 'games' | 'plays' | 'stats' | 'players' | 'events' | 'syncHistory' | 'seasons' | 'teams';
export type Model = Play | Player | Game | Stat | SyncHistory;
export type Direction = 'desc' | 'asc';
export type QueryOptions = {
	table: Table,
	where?: {[key: string]: string | number},
	orderByColumn?:string,
	orderDirection?:Direction
}

@Injectable({
  providedIn: 'root'
})
export class SqlService {
  private initialized: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
	private db!:Database;
	public gamesRepo!: GamesRepository;
	public playsRepo!: PlaysRepository;
	public playersRepo!: PlayersRepository;
	public teamsRepo!: TeamsRepository;
	public eventsRepo!: EventsRepository;
	public statsRepo!: StatsRepository;
	public syncRepo!: SyncRepository;
	public seasonsRepo!: SeasonsRepository;

	constructor() {
		this.init;
	}

	public isReady() {
		return this.initialized.asObservable();
	}

	private async init() {
		const appDataDirPath = await appDataDir();
		console.log(appDataDirPath);

		this.db = await Database.load(databaseName);
		this.gamesRepo = new GamesRepository(this.db);
		this.playsRepo = new PlaysRepository(this.db);
		this.playersRepo = new PlayersRepository(this.db);
		this.teamsRepo = new TeamsRepository(this.db);
		this.eventsRepo = new EventsRepository(this.db);
		this.statsRepo = new StatsRepository(this.db);
		this.syncRepo = new SyncRepository(this.db);
		this.seasonsRepo = new SeasonsRepository(this.db);

		for (let item of upgrades.upgrade) {
			console.log(`Running version ${item.toVersion} upgrades`);
			for (let stmt of item.statements) {
				try {
					await this.db.execute(stmt);
				} catch (error) {
					console.error(error);
				}
			}
		}

		this.initialized.next(true);
	}

	private normalizeWhereParams(where: {[key: string]: string | number} ) {
		for (let item in where) {
			if (typeof where[item] == 'string') {
				where[item] = `'${where[item]}'`;
			}
		}
	}

	private deleteGeneratedColumns(model: any, table: Table, isBulk:boolean = false) {
		if (!isBulk) {
			delete model.id;
		}
		if (table == 'games') {
			delete model.homeFinal;
			delete model.awayFinal;
			delete model.homeTeamTOL;
			delete model.awayTeamTOL;
		} else if (table == 'stats') {
			delete model.points;
			delete model.rebounds;
			delete model.eff;
		}
	}
}

import { Injectable } from '@angular/core';
import { currentDatabaseVersion, databaseName, versions } from 'src/app/migrations/versions';
import { BehaviorSubject } from 'rxjs';
import Database from "tauri-plugin-sql-api";
import { appDataDir } from '@tauri-apps/api/path';
import { GamesRepository } from './repositories/games.repository';
import { EventsRepository } from './repositories/events.repository';
import { PlayersRepository } from './repositories/players.repository';
import { PlaysRepository } from './repositories/plays.repository';
import { SeasonsRepository } from './repositories/seasons.repository';
import { StatsRepository } from './repositories/stats.repository';
import { SyncRepository } from './repositories/sync.repository';
import { TeamsRepository } from './repositories/teams.repository';

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

		await this.runMigrations();

		this.initialized.next(true);
	}

	private async runMigrations() {
		await this.db.execute(`
			CREATE TABLE IF NOT EXISTS __migrations (
				version INTEGER PRIMARY KEY,
				dateExecuted TEXT NOT NULL
			);`);

		const results = await this.db.select<{maxVersion: number | null}[]>(`
			SELECT MAX(version) AS maxVersion FROM __migrations`);

		const currentVersion = results[0].maxVersion;
		const versionsToRun = currentVersion == null ? versions : versions.filter(t => t.toVersion > currentVersion);
		for (let version of versionsToRun) {
			let transaction = 'BEGIN TRANSACTION\n\n';
			for (let stmt of version.statements) {
				transaction += stmt + '\n\n';
			}
			transaction += 'COMMIT;'
			await this.db.execute(transaction);
			await this.db.execute(`
				INSERT INTO __migrations (
					version,
					dateExecuted
				) VALUES (
					${version.toVersion},
					'${new Date().toJSON()}'
				);`);
		}
	}
}

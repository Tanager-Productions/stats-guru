import { Play as dbPlay } from "src/app/interfaces/models";
import { Repository } from "./repository.interface";
import Database from "tauri-plugin-sql-api";
import { Play } from "@tanager/tgs";
import { SyncState } from "src/app/interfaces/syncState.enum";
export class PlaysRepository implements Repository<Play, number> {
	private db: Database;

	constructor(db: Database) {
		this.db = db;
	}

	async find(id: number): Promise<Play> {
		var dbPlay: dbPlay[] = (await this.db.select(`select * from plays where id = '${id}'`));
		var play: Play = {
			order: dbPlay[0].playOrder,
			gameId: dbPlay[0].gameId,
			turboStatsData: dbPlay[0].turboStatsData,
			sgLegacyData: null, //
			player: null, //
			team: null,
			action: dbPlay[0].action,
			period: dbPlay[0].period,
			gameClock: dbPlay[0].gameClock,
			score: dbPlay[0].score,
			timeStamp: dbPlay[0].timeStamp,
		}
		return play;
	}

	async getAll(): Promise<Play[]> {
		var dbPlays:dbPlay[] = (await this.db.select(`select * from plays`));
		return dbPlays.map(obj => ({
		  order: obj.playOrder,
  		gameId: obj.gameId,
  		turboStatsData: obj.turboStatsData,
  		sgLegacyData: null, //
  		player: null, //
  		team: null,
  		action: obj.action,
  		period: obj.period,
 		  gameClock: obj.gameClock,
  		score: obj.score,
  		timeStamp: obj.timeStamp,
		}));
	}

	async add(model: Play): Promise<number> {
		const result = await this.db.execute(
			"INSERT into plays (id, playOrder, gameId, turboStatsData, teamName, playerName, playerNumber, action, period, gameClock, score, timeStamp, syncState) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)",
			[
				0,
				model.order,
				model.gameId,
				model.turboStatsData,
				model.team?.name,
				model.player?.firstName + " " + model.player?.lastName,
				model.player?.number,
				model.action,
				model.period,
				model.gameClock,
				model.score,
				model.timeStamp,
				SyncState.Added
			]
	 );
	 return result.rowsAffected;
	}

	delete(id: number): Promise<void> {
		const result = this.db.execute(`delete * from players where id = '${id}'`);
		return result.then(res => console.log(res));
	}

	update(model: Play): Promise<void> {
		const result = this.db.execute(
			"UPDATE todos SET turboStatsData = $1, teamName = $2, playerName = $3, playerNumber = $4, action = $5, period = $6, gameClock = $7, score = $8, timeStamp = $9, syncState = $10 WHERE playOrder = $11 and gameId = $12",
			[ model.turboStatsData, model.team?.name, model.player?.firstName + " " + model.player?.lastName, model.player?.number, model.action, model.period, model.gameClock, model.score, model.timeStamp, SyncState.Modified, model.order, model.gameId ]
		);
		return result.then(res => console.log(res));
	}

	async bulkAdd(models: Play[]): Promise<void> {
		for(const model of models) {
		await this.db.execute(
			"INSERT into plays (id, playOrder, gameId, turboStatsData, teamName, playerName, playerNumber, action, period, gameClock, score, timeStamp, syncState) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)",
			[
				0,
				model.order,
				model.gameId,
				model.turboStatsData,
				model.team?.name,
				model.player?.firstName + " " + model.player?.lastName,
				model.player?.number,
				model.action,
				model.period,
				model.gameClock,
				model.score,
				model.timeStamp,
				SyncState.Added
			]
		 );
		}
	}

	getByGame(gameId: number): Promise<Play[]> {
		return this.db.select<Play[]>(`
			SELECT 		*
			FROM 			plays
			WHERE 		gameId = ${gameId}
			AND				syncState != 3
			ORDER BY	playOrder DESC
		`);
	}
}

import { Stat as dbStat } from "src/app/interfaces/models";
import { Repository } from "./repository.interface";
import Database from "tauri-plugin-sql-api";
import { Stat } from "@tanager/tgs";
export class StatsRepository implements Repository<Stat, number> {
	private db: Database;

	constructor(db: Database) {
		this.db = db;
	}

	async find(id: number): Promise<Stat> {
		var dbStats:dbStat[] = (await this.db.select(`select * from stats where id = '${id}'`));
		var stat: Stat = {
			gameId: dbStats[0].gameId,
			playerId: dbStats[0].playerId,
			minutes: dbStats[0].minutes,
			assists: dbStats[0].assists,
			rebounds: dbStats[0].rebounds,
			defensiveRebounds: dbStats[0].defensiveRebounds,
			offensiveRebounds: dbStats[0].offensiveRebounds,
			fieldGoalsMade: dbStats[0].fieldGoalsMade,
			fieldGoalsAttempted: dbStats[0].fieldGoalsAttempted,
			blocks:dbStats[0].blocks,
			steals: dbStats[0].steals,
			threesMade: dbStats[0].threesMade,
			threesAttempted: dbStats[0].threesAttempted,
			freeThrowsMade: dbStats[0].freeThrowsMade,
			freeThrowsAttempted: dbStats[0].freeThrowsAttempted,
			points:dbStats[0].points,
			turnovers: dbStats[0].turnovers,
			fouls:  dbStats[0].fouls,
			plusOrMinus: dbStats[0].plusOrMinus,
			eff: dbStats[0].eff,
			technicalFouls:  dbStats[0].technicalFouls,
			onCourt:  dbStats[0].onCourt == 1 ? true : false,
			playerHidden: null,
		}
		return stat;
	}

	async getAll(): Promise<Stat[]> {
		var dbStats:dbStat[] = (await this.db.select(`select * from stats`));
		return dbStats.map(obj => ({
			gameId: obj.gameId,
			playerId: obj.playerId,
			minutes: obj.minutes,
			assists: obj.assists,
			rebounds: obj.rebounds,
			defensiveRebounds: obj.defensiveRebounds,
			offensiveRebounds: obj.offensiveRebounds,
			fieldGoalsMade: obj.fieldGoalsMade,
			fieldGoalsAttempted: obj.fieldGoalsAttempted,
			blocks: obj.blocks,
			steals: obj.steals,
			threesMade: obj.threesMade,
			threesAttempted: obj.threesAttempted,
			freeThrowsMade: obj.freeThrowsMade,
			freeThrowsAttempted: obj.freeThrowsAttempted,
			points: obj.points,
			turnovers: obj.turnovers,
			fouls: obj.fouls,
			plusOrMinus: obj.plusOrMinus,
			eff: obj.eff,
			technicalFouls: obj.technicalFouls,
			onCourt: obj.onCourt == 1 ? true : false,
			playerHidden: null
		}));
	}

	async add(model: Stat): Promise<number> {
		const result = await this.db.execute(
			"INSERT into stats (id, gameId, playerId, minutes, assists, rebounds, defensiveRebounds, offensiveRebounds, fieldGoalsMade, fieldGoalsAttempted, blocks, steals, threesMade, threesAttempted, freeThrowsMade, freeThrowsAttempted, points, turnovers, fouls, plusOrMinus, eff, technicalFouls, onCourt, syncState) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)",
			[ 0,
				model.gameId,
				model.playerId,
				model.minutes,
				model.assists,
				model.rebounds,
				model.defensiveRebounds,
				model.offensiveRebounds,
				model.fieldGoalsMade,
				model.fieldGoalsAttempted,
				model.blocks,
				model.steals,
				model.threesMade,
				model.threesAttempted,
				model.freeThrowsMade,

			]
	 );
	 return result.rowsAffected;
	}

	delete(id: number): Promise<void> {
		const result = this.db.execute(`delete * from stats where id = '${id}'`);
		return result.then((res:any) => console.log(res))
	}

	update(model: Stat): Promise<void> {
		throw new Error("Method not implemented.");
	}

	async bulkAdd(models: Stat[]): Promise<void> {
		for(const model of models) {
			await this.db.execute(
				"INSERT into stats (id, gameId, playerId, minutes, assists, rebounds, defensiveRebounds, offensiveRebounds, fieldGoalsMade, fieldGoalsAttempted, blocks, steals, threesMade, threesAttempted, freeThrowsMade, freeThrowsAttempted, points, turnovers, fouls, plusOrMinus, eff, technicalFouls, onCourt, syncState) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)",
			 [ 0,
				model.gameId,
				model.playerId,
				model.minutes,
				model.assists,
				model.rebounds,
				model.defensiveRebounds,
				model.offensiveRebounds,
				model.fieldGoalsMade,
				model.fieldGoalsAttempted,
				model.blocks,
				model.steals,
				model.threesMade,
				model.threesAttempted,
				model.freeThrowsMade,
			 ]
			);
		}
	}

	async getByGame(gameId: number): Promise<Stat[]> {
		var dbStats : dbStat[] = (await this.db.select<dbStat[]>(`
			SELECT 		*
			FROM 			stats
			WHERE 		gameId = ${gameId}
		`));
		return dbStats.map(obj => ({
			gameId: obj.gameId,
			playerId: obj.playerId,
			minutes: obj.minutes,
			assists: obj.assists,
			rebounds: obj.rebounds,
			defensiveRebounds: obj.defensiveRebounds,
			offensiveRebounds: obj.offensiveRebounds,
			fieldGoalsMade: obj.fieldGoalsMade,
			fieldGoalsAttempted: obj.fieldGoalsAttempted,
			blocks: obj.blocks,
			steals: obj.steals,
			threesMade: obj.threesMade,
			threesAttempted: obj.threesAttempted,
			freeThrowsMade: obj.freeThrowsMade,
			freeThrowsAttempted: obj.freeThrowsAttempted,
			points: obj.points,
			turnovers: obj.turnovers,
			fouls: obj.fouls,
			plusOrMinus: obj.plusOrMinus,
			eff: obj.eff,
			technicalFouls: obj.technicalFouls,
			onCourt: obj.onCourt == 1 ? true : false,
			playerHidden: null
		}));
	}
}

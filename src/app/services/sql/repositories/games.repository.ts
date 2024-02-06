import Database from "tauri-plugin-sql-api";
import { Repository } from "./repository.interface";
import { Game as dbGame } from "src/app/interfaces/models";
import { Game, defaultGameAwayTeam, defaultGameHomeTeam } from "@tanager/tgs";
import { SyncState } from "src/app/interfaces/syncState.enum";
export class GamesRepository implements Repository<Game, number> {
	private db: Database;

	constructor(db: Database) {
		this.db = db;
	}

	async find(id: number): Promise<Game> {
		var dbGame: dbGame[] = (await this.db.select(`select * from games where id = '${id}'`));

		// need to figure out how to deal with home team and away team
		var game: Game = {
			id: dbGame[0].id,
			homeTeam: defaultGameHomeTeam,
			awayTeam: defaultGameAwayTeam,
			gameDate: new Date(dbGame[0].gameDate),
			homePointsQ1: dbGame[0].homePointsQ1,
			awayPointsQ1: dbGame[0].awayPointsQ1,
			homePointsQ2: dbGame[0].homePointsQ2,
			awayPointsQ2: dbGame[0].awayPointsQ2,
			homePointsQ3: dbGame[0].homePointsQ3,
			awayPointsQ3: dbGame[0].awayPointsQ3,
			homePointsQ4: dbGame[0].homePointsQ4,
			awayPointsQ4: dbGame[0].homePointsQ4,
			homePointsOT: dbGame[0].homePointsOT,
			awayPointsOT: dbGame[0].awayPointsOT,
			homeTeamTOL: dbGame[0].homeTeamTOL,
			awayTeamTOL: dbGame[0].awayTeamTOL,
			complete: dbGame[0].complete == 1 ? true : false,
			clock: dbGame[0].clock,
			hasFourQuarters: dbGame[0].hasFourQuarters == 1 ? true : false,
			homeFinal: dbGame[0].homeFinal,
			awayFinal: dbGame[0].awayFinal,
			period: dbGame[0].period,
			gameLink: dbGame[0].gameLink,
			eventId: dbGame[0].eventId,
			homePartialTOL: dbGame[0].homePartialTOL,
			awayPartialTOL: dbGame[0].awayPartialTOL,
			homeFullTOL: dbGame[0].homeFullTOL,
			awayFullTOL: dbGame[0].awayFullTOL,
			homeCurrentFouls: dbGame[0].homeCurrentFouls,
			awayCurrentFouls: dbGame[0].awayCurrentFouls,
			homeHasPossession: dbGame[0].homeHasPossession == 1 ? true : false,
			resetTimeoutsEveryPeriod: dbGame[0].resetTimeoutsEveryPeriod == 1 ? true : false,
			fullTimeoutsPerGame: dbGame[0].fullTimeoutsPerGame,
			partialTimeoutsPerGame: dbGame[0].partialTimeoutsPerGame,
			minutesPerPeriod: dbGame[0].minutesPerPeriod,
			minutesPerOvertime: dbGame[0].minutesPerOvertime,
		}

		return game;
	}

	async getAll(): Promise<Game[]> {
		var dbGames: dbGame[] = (await this.db.select(`select * from games`));
		return dbGames.map(obj => ({
			id: obj.id,
			homeTeam: defaultGameHomeTeam,
			awayTeam: defaultGameAwayTeam,
			gameDate: new Date(obj.gameDate),
			homePointsQ1: obj.homePointsQ1,
			awayPointsQ1: obj.awayPointsQ1,
			homePointsQ2: obj.homePointsQ2,
			awayPointsQ2: obj.awayPointsQ2,
			homePointsQ3: obj.homePointsQ3,
			awayPointsQ3: obj.awayPointsQ3,
			homePointsQ4: obj.homePointsQ4,
			awayPointsQ4: obj.awayPointsQ4,
			homePointsOT: obj.homePointsOT,
			awayPointsOT: obj.awayPointsOT,
			homeTeamTOL: obj.homeTeamTOL,
			awayTeamTOL: obj.awayTeamTOL,
			complete: obj.complete == 1? true : false,
			clock: obj.clock,
			hasFourQuarters: obj.hasFourQuarters == 1? true : false,
			homeFinal: obj.homeFinal,
			awayFinal: obj.awayFinal,
			period: obj.period,
			gameLink: obj.gameLink,
			eventId: obj.eventId,
			homePartialTOL: obj.homePartialTOL,
			awayPartialTOL: obj.awayPartialTOL,
			homeFullTOL: obj.homeFullTOL,
			awayFullTOL: obj.awayFullTOL,
			homeCurrentFouls: obj.homeCurrentFouls,
			awayCurrentFouls: obj.awayCurrentFouls,
			homeHasPossession: obj.homeHasPossession == 1? true : false,
			resetTimeoutsEveryPeriod: obj.resetTimeoutsEveryPeriod  == 1? true : false,
			fullTimeoutsPerGame: obj.fullTimeoutsPerGame,
			partialTimeoutsPerGame: obj.partialTimeoutsPerGame,
			minutesPerPeriod: obj.minutesPerPeriod,
			minutesPerOvertime: obj.minutesPerOvertime,
		}));
	}

	async add(model: Game): Promise<number> {
		const result = await this.db.execute(
			"INSERT into games (id, homeTeamId, awayTeamId,"
			+"gameDate, homePointsQ1, awayPointsQ1, homePointsQ2,"
			+" awayPointsQ2, homePointsQ3, awayPointsQ3, homePointsQ4,"
			+" awayPointsQ4, homePointsOT, awayPointsOT, homeTeamTOL,"
			+" awayTeamTOL, complete, clock, hasFourQuarters, homeFinal,"
			+" awayFinal, period, gameLink, eventId, homePartialTOL,"
			+" awayPartialTOL, homeFullTOL, awayFullTOL, homeCurrentFouls,"
			+" awayCurrentFouls, homeHasPossession, resetTimeoutsEveryPeriod,"
			+" fullTimeoutsPerGame, partialTimeoutsPerGame, minutesPerPeriod,"
			+" minutesPerOvertime, hiddenPlayers, syncState) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33, $34, $35, $36, $37, $38)",
			[ model.id,
				model.homeTeam.teamId,
				model.awayTeam.teamId,
				model.gameDate,
				model.homePointsQ1,
				model.awayPointsQ1,
				model.homePointsQ2,
				model.awayPointsQ2,
				model.homePointsQ3,
				model.awayPointsQ3,
				model.homePointsQ4,
				model.awayPointsQ4,
				model.homePointsOT,
				model.awayPointsOT,
				model.homeTeamTOL,
				model.awayTeamTOL,
				model.complete,
				model.clock,
				model.hasFourQuarters,
				model.homeFinal,
				model.awayFinal,
				model.period,
				model.gameLink,
				model.eventId,
				model.homePartialTOL,
				model.awayPartialTOL,
				model.homeFullTOL,
				model.awayFullTOL,
				model.homeCurrentFouls,
				model.awayCurrentFouls,
				model.homeHasPossession,
				model.resetTimeoutsEveryPeriod,
				model.fullTimeoutsPerGame,
				model.partialTimeoutsPerGame,
				model.minutesPerPeriod,
				model.minutesPerOvertime,
				null,
				SyncState.Added,
			]
	 );
	 return result.rowsAffected;
	}

	async bulkAdd(models: Game[]): Promise<void> {
		for(const model of models) {
			await this.db.execute(
				"INSERT into games (id, homeTeamId, awayTeamId,"
				+"gameDate, homePointsQ1, awayPointsQ1, homePointsQ2,"
				+" awayPointsQ2, homePointsQ3, awayPointsQ3, homePointsQ4,"
				+" awayPointsQ4, homePointsOT, awayPointsOT, homeTeamTOL,"
				+" awayTeamTOL, complete, clock, hasFourQuarters, homeFinal,"
				+" awayFinal, period, gameLink, eventId, homePartialTOL,"
				+" awayPartialTOL, homeFullTOL, awayFullTOL, homeCurrentFouls,"
				+" awayCurrentFouls, homeHasPossession, resetTimeoutsEveryPeriod,"
				+" fullTimeoutsPerGame, partialTimeoutsPerGame, minutesPerPeriod,"
				+" minutesPerOvertime, hiddenPlayers, syncState) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33, $34, $35, $36, $37, $38)",
				[ model.id,
					model.homeTeam.teamId,
					model.awayTeam.teamId,
					model.gameDate,
					model.homePointsQ1,
					model.awayPointsQ1,
					model.homePointsQ2,
					model.awayPointsQ2,
					model.homePointsQ3,
					model.awayPointsQ3,
					model.homePointsQ4,
					model.awayPointsQ4,
					model.homePointsOT,
					model.awayPointsOT,
					model.homeTeamTOL,
					model.awayTeamTOL,
					model.complete,
					model.clock,
					model.hasFourQuarters,
					model.homeFinal,
					model.awayFinal,
					model.period,
					model.gameLink,
					model.eventId,
					model.homePartialTOL,
					model.awayPartialTOL,
					model.homeFullTOL,
					model.awayFullTOL,
					model.homeCurrentFouls,
					model.awayCurrentFouls,
					model.homeHasPossession,
					model.resetTimeoutsEveryPeriod,
					model.fullTimeoutsPerGame,
					model.partialTimeoutsPerGame,
					model.minutesPerPeriod,
					model.minutesPerOvertime,
					null,
					SyncState.Added,
				]
			);
		}
	}

	delete(id: number): Promise<void> {
		const result = this.db.execute(`delete * from games where id = '${id}'`);
		return result.then((res:any) => console.log(res));
	}

	update(model: Game): Promise<void> {
		const result = this.db.execute(
			"UPDATE games SET homeTeamId = $1, awayTeamId = $2, "+
			"gameDate = $3, homePointsQ1 = $4, awayPointsQ1 = $5, "+
			"homePointsQ2 = $6, awayPointsQ2 = $7, homePointsQ3 = $8, "+
			"awayPointsQ3 = $9, homePointsQ4 = $10, awayPointsQ4 = $11, "+
			"homePointsOT = $12, awayPointsOT = $13, homeTeamTOL = $14, awayTeamTOL = $15, "+
			"complete = $16, clock = $17, hasFourQuarters = $18, homeFinal = $19, awayFinal = $20, "+
			"period = $21, gameLink = $22, eventId = $23, homePartialTOL = $24, awayPartialTOL = $25, "+
			"homeFullTOL = $26, awayFullTOL = $27, homeCurrentFouls = $28, awayCurrentFouls = $29, "+
			"homeHasPossession = $30, resetTimeoutsEveryPeriod = $31, fullTimeoutsPerGame = $32, "+
			"partialTimeoutsPerGame = $33, minutesPerPeriod = $34, minutesPerOvertime = $35, "+
			"hiddenPlayers = $36, syncState = $37 WHERE id = $38",
			[
				model.homeTeam.teamId,
				model.awayTeam.teamId,
				model.gameDate,
				model.homePointsQ1,
				model.awayPointsQ1,
				model.homePointsQ2,
				model.awayPointsQ2,
				model.homePointsQ3,
				model.awayPointsQ3,
				model.homePointsQ4,
				model.awayPointsQ4,
				model.homePointsOT,
				model.awayPointsOT,
				model.homeTeamTOL,
				model.awayTeamTOL,
				model.complete,
				model.clock,
				model.hasFourQuarters,
				model.homeFinal,
				model.awayFinal,
				model.period,
				model.gameLink,
				model.eventId,
				model.homePartialTOL,
				model.awayPartialTOL,
				model.homeFullTOL,
				model.awayFullTOL,
				model.homeCurrentFouls,
				model.awayCurrentFouls,
				model.homeHasPossession,
				model.resetTimeoutsEveryPeriod,
				model.fullTimeoutsPerGame,
				model.partialTimeoutsPerGame,
				model.minutesPerPeriod,
				model.minutesPerOvertime,
				null,
				SyncState.Modified,
				model.id
			]
		);
		return result.then((res:any) => console.log(res));
	}
}

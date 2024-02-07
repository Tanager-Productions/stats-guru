import Database from "tauri-plugin-sql-api";
import { Repository } from "./repository.interface";
import { Game as GameEntity } from "src/app/interfaces/models";
import { Game, defaultGameHomeTeam, defaultGameAwayTeam} from "@tanager/tgs";
import { SyncState } from "src/app/interfaces/syncState.enum";

type sgGame = {
	game: Game,
	syncState: SyncState
}

export class GamesRepository implements Repository<sgGame, number> {
	private db: Database;

	constructor(db: Database) {
		this.db = db;
	}
	private mapDbToDto = (obj: GameEntity): sgGame => {
		return {
			game : {
								id: obj.id,
								homeTeam: defaultGameHomeTeam,
								awayTeam: defaultGameAwayTeam,
								gameDate: new Date(obj.gameDate),
								homePointsQ1: obj.homePointsQ1,
								awayPointsQ1: obj.awayPointsQ1,
								homePointsQ2: obj.homePointsQ2,
								awayPointsQ2: obj.awayPointsQ2,
								homePointsQ3: obj.homePointsQ3,
								awayPointsQ3: obj.homePointsQ4,
								homePointsQ4: obj.homePointsQ4,
								awayPointsQ4: obj.awayPointsQ4,
								homePointsOT: obj.homePointsOT,
								awayPointsOT: obj.awayPointsOT,
								homeTeamTOL: obj.homeTeamTOL,
								awayTeamTOL: obj.awayTeamTOL,
								complete: obj.complete == 1 ? true : false,
								clock: obj.clock,
								hasFourQuarters: obj.hasFourQuarters == 1 ? true : false,
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
								homeHasPossession: obj.homeHasPossession == 1 ? true : false,
								resetTimeoutsEveryPeriod: obj.resetTimeoutsEveryPeriod == 1 ? true : false,
								fullTimeoutsPerGame: obj.fullTimeoutsPerGame,
								partialTimeoutsPerGame: obj.partialTimeoutsPerGame,
								minutesPerPeriod: obj.minutesPerPeriod,
								minutesPerOvertime: obj.minutesPerOvertime
							},
			syncState: SyncState.Unchanged
		}
	}

	private mapDtoToDb = (obj: sgGame): GameEntity => {
		return {
			id: obj.game.id,
			homeTeamId: obj.game.homeTeam.teamId,
			awayTeamId: obj.game.awayTeam.teamId,
			gameDate: obj.game.gameDate.toDateString(),
			homePointsQ1: obj.game.homePointsQ1,
			awayPointsQ1: obj.game.awayPointsQ1,
			homePointsQ2: obj.game.homePointsQ2,
			awayPointsQ2: obj.game.awayPointsQ2,
			homePointsQ3: obj.game.homePointsQ3,
			awayPointsQ3: obj.game.awayPointsQ3,
			homePointsQ4: obj.game.homePointsQ4,
			awayPointsQ4: obj.game.awayPointsQ4,
			homePointsOT: obj.game.homePointsOT,
			awayPointsOT: obj.game.awayPointsOT,
			homeTeamTOL: obj.game.homeTeamTOL,
			awayTeamTOL: obj.game.awayTeamTOL,
			complete: obj.game.complete == true? 1 : 0,
			clock: obj.game.clock,
			hasFourQuarters: obj.game.hasFourQuarters == true? 1 : 0,
			homeFinal: obj.game.homeFinal,
			awayFinal: obj.game.awayFinal,
			period: obj.game.period,
			gameLink: obj.game.gameLink,
			eventId: obj.game.eventId,
			homePartialTOL: obj.game.homePartialTOL,
			awayPartialTOL: obj.game.awayPartialTOL,
			homeFullTOL: obj.game.homeFullTOL,
			awayFullTOL: obj.game.awayFullTOL,
			homeCurrentFouls: obj.game.homeCurrentFouls,
			awayCurrentFouls: obj.game.awayCurrentFouls,
			homeHasPossession: obj.game.homeHasPossession == true? 1 : 0,
			resetTimeoutsEveryPeriod: obj.game.resetTimeoutsEveryPeriod == true? 1 : 0,
			fullTimeoutsPerGame: obj.game.fullTimeoutsPerGame,
			partialTimeoutsPerGame: obj.game.partialTimeoutsPerGame,
			minutesPerPeriod: obj.game.minutesPerPeriod,
			minutesPerOvertime: obj.game.minutesPerOvertime
		}
	}

	async find(id: number): Promise<sgGame> {
		const result = (await this.db.select<GameEntity[]>(`select * from games where id = '${id}'`));
		const game = result[0];
		return this.mapDbToDto(game);
	}

	async getAll(): Promise<sgGame[]> {
		var games: GameEntity[] = (await this.db.select(`select * from games`));
		return games.map(this.mapDbToDto);
	}

	async add(model: sgGame): Promise<void> {
		const result = await this.db.execute(`
			INSERT
				into
				games ( homeTeamId,
				awayTeamId,
				gameDate,
				homePointsQ1,
				awayPointsQ1,
				homePointsQ2,
				awayPointsQ2,
				homePointsQ3,
				awayPointsQ3,
				homePointsQ4,
				awayPointsQ4,
				homePointsOT,
				awayPointsOT,
				homeTeamTOL,
				awayTeamTOL,
				complete,
				clock,
				hasFourQuarters,
				homeFinal,
				awayFinal,
				period,
				gameLink,
				eventId,
				homePartialTOL,
				awayPartialTOL,
				homeFullTOL,
				awayFullTOL,
				homeCurrentFouls,
				awayCurrentFouls,
				homeHasPossession,
				resetTimeoutsEveryPeriod,
				fullTimeoutsPerGame,
				partialTimeoutsPerGame,
				minutesPerPeriod,
				minutesPerOvertime,
				syncState)
			VALUES ($1,
			$2,
			$3,
			$4,
			$5,
			$6,
			$7,
			$8,
			$9,
			$10,
			$11,
			$12,
			$13,
			$14,
			$15,
			$16,
			$17,
			$18,
			$19,
			$20,
			$21,
			$22,
			$23,
			$24,
			$25,
			$26,
			$27,
			$28,
			$29,
			$30,
			$31,
			$32,
			$33,
			$34,
			$35,
			$36
		`,
			[
				model.game.homeTeam.teamId,
				model.game.awayTeam.teamId,
				model.game.gameDate,
				model.game.homePointsQ1,
				model.game.awayPointsQ1,
				model.game.homePointsQ2,
				model.game.awayPointsQ2,
				model.game.homePointsQ3,
				model.game.awayPointsQ3,
				model.game.homePointsQ4,
				model.game.awayPointsQ4,
				model.game.homePointsOT,
				model.game.awayPointsOT,
				model.game.homeTeamTOL,
				model.game.awayTeamTOL,
				model.game.complete,
				model.game.clock,
				model.game.hasFourQuarters,
				model.game.homeFinal,
				model.game.awayFinal,
				model.game.period,
				model.game.gameLink,
				model.game.eventId,
				model.game.homePartialTOL,
				model.game.awayPartialTOL,
				model.game.homeFullTOL,
				model.game.awayFullTOL,
				model.game.homeCurrentFouls,
				model.game.awayCurrentFouls,
				model.game.homeHasPossession,
				model.game.resetTimeoutsEveryPeriod,
				model.game.fullTimeoutsPerGame,
				model.game.partialTimeoutsPerGame,
				model.game.minutesPerPeriod,
				model.game.minutesPerOvertime,
				SyncState.Added
			]
	 );
	 model.game.id = result.lastInsertId;
	}

	async bulkAdd(models: sgGame[]): Promise<void> {
		const dbGames: GameEntity[] = models.map(this.mapDtoToDb);
		await this.db.execute(`
				INSERT
					into
					games ( homeTeamId,
					awayTeamId,
					gameDate,
					homePointsQ1,
					awayPointsQ1,
					homePointsQ2,
					awayPointsQ2,
					homePointsQ3,
					awayPointsQ3,
					homePointsQ4,
					awayPointsQ4,
					homePointsOT,
					awayPointsOT,
					homeTeamTOL,
					awayTeamTOL,
					complete,
					clock,
					hasFourQuarters,
					homeFinal,
					awayFinal,
					period,
					gameLink,
					eventId,
					homePartialTOL,
					awayPartialTOL,
					homeFullTOL,
					awayFullTOL,
					homeCurrentFouls,
					awayCurrentFouls,
					homeHasPossession,
					resetTimeoutsEveryPeriod,
					fullTimeoutsPerGame,
					partialTimeoutsPerGame,
					minutesPerPeriod,
					minutesPerOvertime,
					syncState)
				VALUES ($1,
				$2,
				$3,
				$4,
				$5,
				$6,
				$7,
				$8,
				$9,
				$10,
				$11,
				$12,
				$13,
				$14,
				$15,
				$16,
				$17,
				$18,
				$19,
				$20,
				$21,
				$22,
				$23,
				$24,
				$25,
				$26,
				$27,
				$28,
				$29,
				$30,
				$31,
				$32,
				$33,
				$34,
				$35,
				$36
		`,
			[ dbGames ]
	 );
	}

	async delete(id: number): Promise<void> {
		await this.db.execute(`
			DELETE		*
			FROM	games
			WHERE id = '${id}'
		`);
	}

	async update(model: sgGame): Promise<void> {
		await this.db.execute(`
			UPDATE
				games
			SET
				homeTeamId = $1,
				awayTeamId = $2,
				gameDate = $3,
				homePointsQ1 = $4,
				awayPointsQ1 = $5,
				homePointsQ2 = $6,
				awayPointsQ2 = $7,
				homePointsQ3 = $8,
				awayPointsQ3 = $9,
				homePointsQ4 = $10,
				awayPointsQ4 = $11,
				homePointsOT = $12,
				awayPointsOT = $13,
				homeTeamTOL = $14,
				awayTeamTOL = $15,
				complete = $16,
				clock = $17,
				hasFourQuarters = $18,
				homeFinal = $19,
				awayFinal = $20,
				period = $21,
				gameLink = $22,
				eventId = $23,
				homePartialTOL = $24,
				awayPartialTOL = $25,
				homeFullTOL = $26,
				awayFullTOL = $27,
				homeCurrentFouls = $28,
				awayCurrentFouls = $29,
				homeHasPossession = $30,
				resetTimeoutsEveryPeriod = $31,
				fullTimeoutsPerGame = $32,
				partialTimeoutsPerGame = $33,
				minutesPerPeriod = $34,
				minutesPerOvertime = $35,
				syncState = $36
			WHERE
				id = $37
		`,
			[
				model.game.homeTeam.teamId,
				model.game.awayTeam.teamId,
				model.game.gameDate,
				model.game.homePointsQ1,
				model.game.awayPointsQ1,
				model.game.homePointsQ2,
				model.game.awayPointsQ2,
				model.game.homePointsQ3,
				model.game.awayPointsQ3,
				model.game.homePointsQ4,
				model.game.awayPointsQ4,
				model.game.homePointsOT,
				model.game.awayPointsOT,
				model.game.homeTeamTOL,
				model.game.awayTeamTOL,
				model.game.complete,
				model.game.clock,
				model.game.hasFourQuarters,
				model.game.homeFinal,
				model.game.awayFinal,
				model.game.period,
				model.game.gameLink,
				model.game.eventId,
				model.game.homePartialTOL,
				model.game.awayPartialTOL,
				model.game.homeFullTOL,
				model.game.awayFullTOL,
				model.game.homeCurrentFouls,
				model.game.awayCurrentFouls,
				model.game.homeHasPossession,
				model.game.resetTimeoutsEveryPeriod,
				model.game.fullTimeoutsPerGame,
				model.game.partialTimeoutsPerGame,
				model.game.minutesPerPeriod,
				model.game.minutesPerOvertime,
				SyncState.Modified,
				model.game.id
			]
		);
	}
}

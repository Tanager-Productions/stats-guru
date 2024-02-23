import Database from "tauri-plugin-sql-api";
import { Repository } from "./repository.interface";
import { GameEntity } from "src/app/interfaces/entities";
import { Game } from "src/app/interfaces/sgDtos";
import { TeamTypes } from "@tanager/tgs/src/enums/team-types";

export type HomePageGame = {
	gameId:number,
	gameDate:string,
	homeTeamName:string,
	awayTeamName:string,
	homeTeamLogo:string|null,
	awayTeamLogo:string|null,
	eventId:number|null
};

interface GameEntityWithChildren extends GameEntity {
  hometeamName: string;
  homeIsMale: boolean;
  homeSeasonId: number;
  hometeamType: TeamTypes;

  awayteamName: string;
  awayIsMale: boolean;
  awaySeasonId: number;
  awayteamType: TeamTypes;
}

export class GamesRepository implements Repository<GameEntityWithChildren, Game, number> {
	private db: Database;

	constructor(db: Database) {
		this.db = db;
	}

	mapDbToDto = (entity: GameEntityWithChildren): Game => {
		return {
			id: entity.id,
			homeTeam: {
				teamId: entity.homeTeamId,
				teamName: entity.hometeamName,
				isMale: entity.homeIsMale,
				seasonId: entity.homeSeasonId,
				teamType: entity.hometeamType
			},
			awayTeam: {
				teamId: entity.awayTeamId,
				teamName: entity.awayteamName,
				isMale: entity.awayIsMale,
				seasonId: entity.awaySeasonId,
				teamType: entity.awayteamType
			},
			gameDate: entity.gameDate,
			homePointsQ1: entity.homePointsQ1,
			awayPointsQ1: entity.awayPointsQ1,
			homePointsQ2: entity.homePointsQ2,
			awayPointsQ2: entity.awayPointsQ2,
			homePointsQ3: entity.homePointsQ3,
			awayPointsQ3: entity.homePointsQ4,
			homePointsQ4: entity.homePointsQ4,
			awayPointsQ4: entity.awayPointsQ4,
			homePointsOT: entity.homePointsOT,
			awayPointsOT: entity.awayPointsOT,
			homeTeamTOL: entity.homeTeamTOL,
			awayTeamTOL: entity.awayTeamTOL,
			complete: entity.complete == 1 ? true : false,
			clock: entity.clock,
			hasFourQuarters: entity.hasFourQuarters == 1 ? true : false,
			homeFinal: entity.homeFinal,
			awayFinal: entity.awayFinal,
			period: entity.period,
			gameLink: entity.gameLink,
			eventId: entity.eventId,
			homePartialTOL: entity.homePartialTOL,
			awayPartialTOL: entity.awayPartialTOL,
			homeFullTOL: entity.homeFullTOL,
			awayFullTOL: entity.awayFullTOL,
			homeCurrentFouls: entity.homeCurrentFouls,
			awayCurrentFouls: entity.awayCurrentFouls,
			homeHasPossession: entity.homeHasPossession == 1 ? true : false,
			resetTimeoutsEveryPeriod: entity.resetTimeoutsEveryPeriod == 1 ? true : false,
			fullTimeoutsPerGame: entity.fullTimeoutsPerGame,
			partialTimeoutsPerGame: entity.partialTimeoutsPerGame,
			minutesPerPeriod: entity.minutesPerPeriod,
			minutesPerOvertime: entity.minutesPerOvertime,
			syncState: entity.syncState
		}
	}

	 mapDtoToDb = (dto: Game): GameEntityWithChildren => {
		return {
			id: dto.id,
			homeTeamId: dto.homeTeam.teamId,
			awayTeamId: dto.awayTeam.teamId,
			gameDate: dto.gameDate,
			homePointsQ1: dto.homePointsQ1,
			awayPointsQ1: dto.awayPointsQ1,
			homePointsQ2: dto.homePointsQ2,
			awayPointsQ2: dto.awayPointsQ2,
			homePointsQ3: dto.homePointsQ3,
			awayPointsQ3: dto.awayPointsQ3,
			homePointsQ4: dto.homePointsQ4,
			awayPointsQ4: dto.awayPointsQ4,
			homePointsOT: dto.homePointsOT,
			awayPointsOT: dto.awayPointsOT,
			homeTeamTOL: dto.homeTeamTOL,
			awayTeamTOL: dto.awayTeamTOL,
			complete: dto.complete == true ? 1 : 0,
			clock: dto.clock,
			hasFourQuarters: dto.hasFourQuarters == true ? 1 : 0,
			homeFinal: dto.homeFinal,
			awayFinal: dto.awayFinal,
			period: dto.period,
			gameLink: dto.gameLink,
			eventId: dto.eventId,
			homePartialTOL: dto.homePartialTOL,
			awayPartialTOL: dto.awayPartialTOL,
			homeFullTOL: dto.homeFullTOL,
			awayFullTOL: dto.awayFullTOL,
			homeCurrentFouls: dto.homeCurrentFouls,
			awayCurrentFouls: dto.awayCurrentFouls,
			homeHasPossession: dto.homeHasPossession == true ? 1 : 0,
			resetTimeoutsEveryPeriod: dto.resetTimeoutsEveryPeriod == true ? 1 : 0,
			fullTimeoutsPerGame: dto.fullTimeoutsPerGame,
			partialTimeoutsPerGame: dto.partialTimeoutsPerGame,
			minutesPerPeriod: dto.minutesPerPeriod,
			minutesPerOvertime: dto.minutesPerOvertime,
			syncState: dto.syncState,

			hometeamName: null!,
			homeIsMale: null!,
			homeSeasonId: null!,
			hometeamType: null!,

			awayteamName: null!,
			awayIsMale: null!,
			awaySeasonId: null!,
			awayteamType: null!,
		}
	}

	async find(id: number): Promise<Game> {
    const games = await this.db.select<GameEntityWithChildren[]>(`
			SELECT * FROM games WHERE id = $1`, [id]);
    return this.mapDbToDto(games[0]);
	}

	async getAll(): Promise<Game[]> {
		const games = await this.db.select<GameEntityWithChildren[]>(`select * from games`);
		return games.map(this.mapDbToDto);
	}

	async add(model: Game): Promise<void> {
    const entity = this.mapDtoToDb(model);
    const sql = `
			INSERT INTO games (
				homeTeamId, awayTeamId, gameDate, homePointsQ1, awayPointsQ1, homePointsQ2, awayPointsQ2,
				homePointsQ3, awayPointsQ3, homePointsQ4, awayPointsQ4, homePointsOT, awayPointsOT,
				complete, clock, hasFourQuarters, period, gameLink, eventId, homePartialTOL, awayPartialTOL,
				homeFullTOL, awayFullTOL, homeCurrentFouls, awayCurrentFouls, homeHasPossession,
				resetTimeoutsEveryPeriod, fullTimeoutsPerGame, partialTimeoutsPerGame, minutesPerPeriod, minutesPerOvertime
			) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18,
				$19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31)`;
    const values = [
			entity.homeTeamId, entity.awayTeamId, entity.gameDate, entity.homePointsQ1, entity.awayPointsQ1,
			entity.homePointsQ2, entity.awayPointsQ2, entity.homePointsQ3, entity.awayPointsQ3,
			entity.homePointsQ4, entity.awayPointsQ4, entity.homePointsOT, entity.awayPointsOT,
			entity.complete, entity.clock, entity.hasFourQuarters, entity.period, entity.gameLink,
			entity.eventId, entity.homePartialTOL, entity.awayPartialTOL, entity.homeFullTOL,
			entity.awayFullTOL, entity.homeCurrentFouls, entity.awayCurrentFouls, entity.homeHasPossession,
			entity.resetTimeoutsEveryPeriod, entity.fullTimeoutsPerGame, entity.partialTimeoutsPerGame,
			entity.minutesPerPeriod, entity.minutesPerOvertime
    ];
    const result = await this.db.execute(sql, values);
    model.id = result.lastInsertId;
	}


	async delete(id: number): Promise<void> {
		await this.db.execute(`
			DELETE FROM	games WHERE id = $1`, [id]);
	}

	async update(model: Game): Promise<void> {
    const entity = this.mapDtoToDb(model);
    const sql = `
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
				complete = $14,
				clock = $15,
				hasFourQuarters = $16,
				period = $17,
				gameLink = $18,
				eventId = $19,
				homePartialTOL = $20,
				awayPartialTOL = $21,
				homeFullTOL = $22,
				awayFullTOL = $23,
				homeCurrentFouls = $24,
				awayCurrentFouls = $25,
				homeHasPossession = $26,
				resetTimeoutsEveryPeriod = $27,
				fullTimeoutsPerGame = $28,
				partialTimeoutsPerGame = $29,
				minutesPerPeriod = $30,
				minutesPerOvertime = $31
			WHERE
				id = $36`;
    const values = [
			entity.homeTeamId, entity.awayTeamId, entity.gameDate, entity.homePointsQ1, entity.awayPointsQ1,
			entity.homePointsQ2, entity.awayPointsQ2, entity.homePointsQ3, entity.awayPointsQ3,
			entity.homePointsQ4, entity.awayPointsQ4, entity.homePointsOT, entity.awayPointsOT,
			entity.homeTeamTOL, entity.awayTeamTOL, entity.complete, entity.clock, entity.hasFourQuarters,
			entity.homeFinal, entity.awayFinal, entity.period, entity.gameLink, entity.eventId,
			entity.homePartialTOL, entity.awayPartialTOL, entity.homeFullTOL, entity.awayFullTOL,
			entity.homeCurrentFouls, entity.awayCurrentFouls, entity.homeHasPossession,
			entity.resetTimeoutsEveryPeriod, entity.fullTimeoutsPerGame, entity.partialTimeoutsPerGame,
			entity.minutesPerPeriod, entity.minutesPerOvertime, entity.id
    ];
    await this.db.execute(sql, values);
	}


	async bulkAdd(models: Game[]): Promise<void> {
		if (models.length === 0) {
			return;
		}

		const fieldsPerModel = 31;
		const placeholders = models.map((_, index) => `($${Array.from({length: fieldsPerModel}, (_, i) => index * fieldsPerModel + i + 1).join(', ')})`);
		const dtos = models.flatMap(model => this.mapDtoToDb(model));
		const values = dtos.map(entity => [
				entity.homeTeamId, entity.awayTeamId, entity.gameDate, entity.homePointsQ1, entity.awayPointsQ1,
				entity.homePointsQ2, entity.awayPointsQ2, entity.homePointsQ3, entity.awayPointsQ3,
				entity.homePointsQ4, entity.awayPointsQ4, entity.homePointsOT, entity.awayPointsOT,
				entity.complete, entity.clock, entity.hasFourQuarters,
				entity.period, entity.gameLink || null, entity.eventId,
				entity.homePartialTOL, entity.awayPartialTOL, entity.homeFullTOL, entity.awayFullTOL,
				entity.homeCurrentFouls, entity.awayCurrentFouls, entity.homeHasPossession,
				entity.resetTimeoutsEveryPeriod, entity.fullTimeoutsPerGame, entity.partialTimeoutsPerGame,
				entity.minutesPerPeriod, entity.minutesPerOvertime
			]).flat();

		const sql = `
			INSERT INTO games (
				homeTeamId, awayTeamId, gameDate, homePointsQ1, awayPointsQ1, homePointsQ2, awayPointsQ2,
				homePointsQ3, awayPointsQ3, homePointsQ4, awayPointsQ4, homePointsOT, awayPointsOT,
				complete, clock, hasFourQuarters, period, gameLink, eventId, homePartialTOL, awayPartialTOL,
				homeFullTOL, awayFullTOL, homeCurrentFouls, awayCurrentFouls, homeHasPossession,
				resetTimeoutsEveryPeriod, fullTimeoutsPerGame, partialTimeoutsPerGame,
				minutesPerPeriod, minutesPerOvertime
			) VALUES ${placeholders.join(", ")}`;

		await this.db.execute(sql, values);
	}


	public gamesForHomePage() {
		return this.db.select<HomePageGame[]>(`
			SELECT
				g.id as gameId,
				g.gameDate,
				g.eventId,
				homeTeam.name AS homeTeamName,
				awayTeam.name AS awayTeamName,
				homeTeam.defaultLogo AS homeTeamLogo,
				awayTeam.defaultLogo AS awayTeamLogo
			FROM
				Games g
			JOIN
				Teams AS homeTeam ON g.homeTeamId = homeTeam.id
			JOIN
				Teams AS awayTeam ON g.awayTeamId = awayTeam.id
			ORDER BY
				g.gameDate DESC;`);
	}
}

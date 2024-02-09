import Database from "tauri-plugin-sql-api";
import { Repository } from "./repository.interface";
import { GameEntity } from "src/app/interfaces/entities";
import { Game } from "src/app/interfaces/sgDtos";
import { TeamTypes } from "@tanager/tgs/src/enums/team-types";

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
			complete: dto.complete == true? 1 : 0,
			clock: dto.clock,
			hasFourQuarters: dto.hasFourQuarters == true? 1 : 0,
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
			homeHasPossession: dto.homeHasPossession == true? 1 : 0,
			resetTimeoutsEveryPeriod: dto.resetTimeoutsEveryPeriod == true? 1 : 0,
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
		const games = await this.db.select<GameEntityWithChildren[]>(`select * from games where id = ${id}`);
		return this.mapDbToDto(games[0]);
	}

	async getAll(): Promise<Game[]> {
		var games: GameEntityWithChildren[] = (await this.db.select(`select * from games`));
		return games.map(this.mapDbToDto);
	}

	async add(model: Game): Promise<void> {
		const entity = this.mapDtoToDb(model);
		const result = await this.db.execute(`
			INSERT INTO games (
				homeTeamId,
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
				minutesPerOvertime
			) VALUES (
				${entity.homeTeamId},
				${entity.awayTeamId},
				'${entity.gameDate}',
				${entity.homePointsQ1},
				${entity.awayPointsQ1},
				${entity.homePointsQ2},
				${entity.awayPointsQ2},
				${entity.homePointsQ3},
				${entity.awayPointsQ3},
				${entity.homePointsQ4},
				${entity.awayPointsQ4},
				${entity.homeTeamTOL},
				${entity.awayTeamTOL},
				${entity.complete},
				'${entity.clock}',
				${entity.hasFourQuarters},
				${entity.homeFinal},
				${entity.awayFinal},
				${entity.period},
				${entity.gameLink ? `'${entity.gameLink}'` : null},
				${entity.eventId},
				${entity.homePartialTOL},
				${entity.awayPartialTOL},
				${entity.homeFullTOL},
				${entity.awayFullTOL},
				${entity.homeCurrentFouls},
				${entity.awayCurrentFouls},
				${entity.homeHasPossession},
				${entity.resetTimeoutsEveryPeriod},
				${entity.fullTimeoutsPerGame},
				${entity.partialTimeoutsPerGame},
				${entity.minutesPerPeriod},
				${entity.minutesPerOvertime}
			);`);
		model.id = result.lastInsertId;
	}

	async delete(id: number): Promise<void> {
		await this.db.execute(`
			DELETE FROM	games
			WHERE id = ${id}`);
	}

	async update(model: Game): Promise<void> {
		const entity = this.mapDtoToDb(model);

		await this.db.execute(`
			UPDATE games
			SET
				homeTeamId = ${entity.homeTeamId},
				awayTeamId = ${entity.awayTeamId},
				gameDate = '${entity.gameDate}',
				homePointsQ1 = ${entity.homePointsQ1},
				awayPointsQ1 = ${entity.awayPointsQ1},
				homePointsQ2 = ${entity.homePointsQ2},
				awayPointsQ2 = ${entity.awayPointsQ2},
				homePointsQ3 = ${entity.homePointsQ3},
				awayPointsQ3 = ${entity.awayPointsQ3},
				homePointsQ4 = ${entity.homePointsQ4},
				awayPointsQ4 = ${entity.awayPointsQ4},
				homePointsOT = ${entity.homePointsOT},
				awayPointsOT = ${entity.awayPointsOT},
				homeTeamTOL = ${entity.homeTeamTOL},
				awayTeamTOL = ${entity.awayTeamTOL},
				complete = ${entity.complete},
				clock = '${entity.clock}',
				hasFourQuarters = ${entity.hasFourQuarters},
				homeFinal = ${entity.homeFinal},
				awayFinal = ${entity.awayFinal},
				period = ${entity.period},
				gameLink = ${entity.gameLink ? `'${entity.gameLink}'` : null},
				eventId = ${entity.eventId},
				homePartialTOL = ${entity.homePartialTOL},
				awayPartialTOL = ${entity.awayPartialTOL},
				homeFullTOL = ${entity.homeFullTOL},
				awayFullTOL = ${entity.awayFullTOL},
				homeCurrentFouls = ${entity.homeCurrentFouls},
				awayCurrentFouls = ${entity.awayCurrentFouls},
				homeHasPossession = ${entity.homeHasPossession},
				resetTimeoutsEveryPeriod = ${entity.resetTimeoutsEveryPeriod},
				fullTimeoutsPerGame = ${entity.fullTimeoutsPerGame},
				partialTimeoutsPerGame = ${entity.partialTimeoutsPerGame},
				minutesPerPeriod = ${entity.minutesPerPeriod},
				minutesPerOvertime = ${entity.minutesPerOvertime}
			WHERE
				id = ${entity.id}`);
	}

	async bulkAdd(models: Game[]): Promise<void> {
    if (models.length === 0) {
			return;
    }

		const entities = models.map(model => this.mapDtoToDb(model));

    const valuesClause = entities.map(entity => `(
			${entity.homeTeamId},
			${entity.awayTeamId},
			'${entity.gameDate}',
			${entity.homePointsQ1},
			${entity.awayPointsQ1},
			${entity.homePointsQ2},
			${entity.awayPointsQ2},
			${entity.homePointsQ3},
			${entity.awayPointsQ3},
			${entity.homePointsQ4},
			${entity.homePointsOT},
			${entity.awayPointsOT},
			${entity.homePointsOT},
			${entity.homeTeamTOL},
			${entity.awayTeamTOL},
			${entity.complete},
			'${entity.clock}',
			${entity.hasFourQuarters},
			${entity.homeFinal},
			${entity.awayFinal},
			${entity.period},
			${entity.gameLink ? `'${entity.gameLink}'` : null},
			${entity.eventId},
			${entity.homePartialTOL},
			${entity.awayPartialTOL},
			${entity.homeFullTOL},
			${entity.awayFullTOL},
			${entity.homeCurrentFouls},
			${entity.awayCurrentFouls},
			${entity.homeHasPossession},
			${entity.resetTimeoutsEveryPeriod},
		  ${entity.fullTimeoutsPerGame},
			${entity.partialTimeoutsPerGame},
			${entity.minutesPerPeriod},
			${entity.minutesPerOvertime})`).join(', ');

			await this.db.execute(`
				INSERT INTO games (
					homeTeamId,
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
					minutesPerOvertime)
				VALUES ${valuesClause};`);
	}
}

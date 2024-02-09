import { PlayEntity } from "src/app/interfaces/entities";
import { Play } from "src/app/interfaces/sgDtos";
import Database from "tauri-plugin-sql-api";
import { Repository } from "./repository.interface";

interface PlayEntityWithChildren extends PlayEntity {
	//player
	firstName: string;
	lastName: string;
	number: number;

	//Team
	name: string
}

export class PlaysRepository implements Repository<PlayEntityWithChildren, Play, { id: number; gameId: number }> {
	private db: Database;

	constructor(db: Database) {
		this.db = db;
	}

	mapDbToDto = (entity: PlayEntityWithChildren): Play => {
		return {
			id: entity.id,
			gameId: entity.gameId,
			turboStatsData: entity.turboStatsData,
			sgLegacyData: entity.sgLegacyData,
			team: !entity.teamId ? null : {
				teamId: entity.teamId,
				name: entity.name
			},
			player: !entity.playerId ? null : {
				playerId: entity.playerId,
				firstName: entity.firstName,
				lastName: entity.lastName,
				number: entity.number
			},
			action: entity.action,
			period: entity.period,
			gameClock: entity.gameClock,
			timeStamp: entity.timeStamp,
			score: entity.score,
			syncState: entity.syncState
		};
	}

	mapDtoToDb = (dto: Play): PlayEntityWithChildren => {
		return {
			id: dto.id,
			gameId: dto.gameId,
			turboStatsData: dto.turboStatsData,
			sgLegacyData: dto.sgLegacyData,
			teamId: dto.team ? dto.team.teamId : null,
			playerId: dto.player ? dto.player.playerId : null,
			action: dto.action,
			period: dto.period,
			gameClock: dto.gameClock,
			timeStamp: dto.timeStamp,
			score: dto.score,
			syncState: dto.syncState,

			//don't need children
			firstName: null!,
			lastName: null!,
			number: null!,
			name: null!
		};
	}

	async find(id: { id: number; gameId: number }): Promise<Play> {
		const plays = await this.db.select<PlayEntityWithChildren[]>(`
			SELECT 			plays.*,
									teams.name,
									players.firstName,
									players.lastName,
									players.number
			FROM 				plays
			LEFT JOIN 	teams ON plays.teamId = teams.id
			LEFT JOIN 	players ON plays.playerId = players.id
			WHERE 			id = ${id.id}
			AND 				gameId = ${id.gameId}`);
		return this.mapDbToDto(plays[0]);
	}

	async getAll(): Promise<Play[]> {
		const plays = await this.db.select<PlayEntityWithChildren[]>(`
			SELECT 			plays.*,
									teams.name,
									players.firstName,
									players.lastName,
									players.number
			FROM 				plays
			LEFT JOIN 	teams ON plays.teamId = teams.id
			LEFT JOIN 	players ON plays.playerId = players.id`);
		return plays.map(this.mapDbToDto);
	}

	async add(model: Play): Promise<void> {
		const entity = this.mapDtoToDb(model);
		await this.db.execute(`
			INSERT INTO plays (
				id,
				gameId,
				turboStatsData,
				sgLegacyData,
				teamId,
				playerId,
				action,
				period,
				gameClock,
				score,
				timeStamp
			) VALUES (
				${entity.id},
				${entity.gameId},
				${entity.turboStatsData ? `'${entity.turboStatsData}'` : null},
				${entity.sgLegacyData ? `'${entity.sgLegacyData}'` : null},
				${entity.teamId},
				${entity.playerId},
				${entity.action},
				${entity.period},
				${entity.gameClock ? `'${entity.gameClock}'` : null},
				${entity.score ? `'${entity.score}'` : null},
				${entity.timeStamp ? `'${entity.timeStamp}'` : null}
			);`);
	}

	async delete(id: { id: number; gameId: number }): Promise<void> {
		await this.db.execute(`
			DELETE FROM plays
			WHERE id = ${id.id}
			AND gameId = ${id.gameId}`);
	}

	async update(model: Play): Promise<void> {
    const entity = this.mapDtoToDb(model);

    await this.db.execute(`
			UPDATE plays
			SET
				id = ${entity.id},
				gameId = ${entity.gameId},
				turboStatsData = ${entity.turboStatsData ? `'${entity.turboStatsData}'` : null},
				sgLegacyData = ${entity.sgLegacyData ? `'${entity.sgLegacyData}'` : null},
				teamId = ${entity.teamId},
				playerId = ${entity.playerId},
				action = ${entity.action},
				period = ${entity.period},
				gameClock = ${entity.gameClock ? `'${entity.gameClock}'` : null},
				score = ${entity.score ? `'${entity.score}'` : null},
				timeStamp = ${entity.timeStamp ? `'${entity.timeStamp}'` : null}
			WHERE
				id = ${entity.id} AND gameId = ${entity.gameId}`);
	}

	async bulkAdd(models: Play[]): Promise<void> {
    if (models.length === 0) {
			return;
    }

    const entities = models.map(model => this.mapDtoToDb(model));

    const valuesClause = entities.map(entity => `(
			${entity.id},
			${entity.gameId},
			${entity.turboStatsData ? `'${entity.turboStatsData}'` : null},
			${entity.sgLegacyData ? `'${entity.sgLegacyData}'` : null},
			${entity.teamId},
			${entity.playerId},
			${entity.action},
			${entity.period},
			${entity.gameClock ? `'${entity.gameClock}'` : null},
			${entity.score ? `'${entity.score}'` : null},
			${entity.timeStamp ? `'${entity.timeStamp}'` : null})`).join(', ');

    await this.db.execute(`
			INSERT INTO plays (
				id,
				gameId,
				turboStatsData,
				sgLegacyData,
				teamId,
				playerId,
				action,
				period,
				gameClock,
				score,
				timeStamp
			) VALUES ${valuesClause};`);
	}
}

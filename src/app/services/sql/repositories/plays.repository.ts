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
			SELECT
				plays.*,
				teams.name,
				players.firstName,
				players.lastName,
				players.number
			FROM
				plays
			LEFT JOIN teams ON
				plays.teamId = teams.id
			LEFT JOIN players ON
				plays.playerId = players.id
			WHERE
				plays.id = $1
				AND plays.gameId = $2`, [id.id, id.gameId]);
    return this.mapDbToDto(plays[0]);
	}


	async getAll(): Promise<Play[]> {
		const plays = await this.db.select<PlayEntityWithChildren[]>(`
			SELECT
				plays.*,
				teams.name,
				players.firstName,
				players.lastName,
				players.number
			FROM
				plays
			LEFT JOIN teams ON
				plays.teamId = teams.id
			LEFT JOIN players ON
				plays.playerId = players.id`);
		return plays.map(this.mapDbToDto);
	}

	async add(model: Play): Promise<void> {
    const entity = this.mapDtoToDb(model);
    await this.db.execute(`
			INSERT INTO plays (
				gameId, turboStatsData, sgLegacyData, teamId, playerId, action,
				period, gameClock, score, timeStamp, syncState
			) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`, [
				entity.gameId, entity.turboStatsData, entity.sgLegacyData, entity.teamId,
				entity.playerId, entity.action, entity.period, entity.gameClock,
				entity.score, entity.timeStamp, entity.syncState
			]);
	}

	async delete(id: { id: number; gameId: number }): Promise<void> {
    await this.db.execute(`
			DELETE FROM plays WHERE id = $1 AND gameId = $2`, [id.id, id.gameId]);
	}


	async update(model: Play): Promise<void> {
    const entity = this.mapDtoToDb(model);
    await this.db.execute(`
			UPDATE plays SET
				turboStatsData = $1, sgLegacyData = $2, teamId = $3, playerId = $4, action = $5,
				period = $6, gameClock = $7, score = $8, timeStamp = $9, syncState = $10
			WHERE id = $11 AND gameId = $12`, [
			entity.turboStatsData, entity.sgLegacyData, entity.teamId, entity.playerId,
			entity.action, entity.period, entity.gameClock, entity.score,
			entity.timeStamp, entity.syncState, entity.id, entity.gameId
    ]);
	}

	async bulkAdd(models: Play[]): Promise<void> {
    if (models.length === 0) {
			return;
		}

    const placeholders = models.map((_, index) =>  `(
			$${index * 11 + 1}, $${index * 11 + 2}, $${index * 11 + 3}, $${index * 11 + 4}, $${index * 11 + 5},
			$${index * 11 + 6}, $${index * 11 + 7}, $${index * 11 + 8}, $${index * 11 + 9}, $${index * 11 + 10},
			$${index * 11 + 11})`).join(', ');

    const values = models.flatMap(model => {
        const entity = this.mapDtoToDb(model);
        return [
					entity.gameId, entity.turboStatsData, entity.sgLegacyData, entity.teamId, entity.playerId,
					entity.action, entity.period, entity.gameClock, entity.score,
					entity.timeStamp, entity.syncState
        ];
    });

    await this.db.execute(`
			INSERT INTO plays (
				gameId, turboStatsData, sgLegacyData, teamId, playerId, action,
				period, gameClock, score, timeStamp, syncState
			) VALUES ${placeholders}`, values);
	}

}

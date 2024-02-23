import { Stat } from "src/app/interfaces/sgDtos";
import { Repository } from "./repository.interface";
import Database from "tauri-plugin-sql-api";
import { StatEntity } from "src/app/interfaces/entities";

export class StatsRepository implements Repository<StatEntity, Stat, {playerId: number, gameId: number}> {
	private db: Database;

	constructor(db: Database) {
		this.db = db;
	}

	mapDbToDto = (entity: StatEntity): Stat => {
		return {
			gameId: entity.gameId,
			playerId: entity.playerId,
			minutes: entity.minutes,
			assists: entity.assists,
			rebounds: entity.rebounds,
			defensiveRebounds: entity.defensiveRebounds,
			offensiveRebounds: entity.offensiveRebounds,
			fieldGoalsMade: entity.fieldGoalsMade,
			fieldGoalsAttempted: entity.fieldGoalsAttempted,
			blocks: entity.blocks,
			steals: entity.steals,
			threesMade: entity.threesMade,
			threesAttempted: entity.threesAttempted,
			freeThrowsMade: entity.freeThrowsMade,
			freeThrowsAttempted: entity.freeThrowsAttempted,
			points: entity.points,
			turnovers: entity.turnovers,
			fouls: entity.fouls,
			plusOrMinus: entity.plusOrMinus,
			eff: entity.eff,
			technicalFouls: entity.technicalFouls,
			onCourt: entity.onCourt == 1 ? true : false,
			playerHidden: null,
			syncState: entity.syncState
		}
	}

	mapDtoToDb = (dto: Stat): StatEntity => {
		return {
			gameId: dto.gameId,
			playerId: dto.playerId,
			minutes: dto.minutes,
			assists: dto.assists,
			rebounds: dto.rebounds,
			defensiveRebounds: dto.defensiveRebounds,
			offensiveRebounds: dto.offensiveRebounds,
			fieldGoalsMade: dto.fieldGoalsMade,
			fieldGoalsAttempted: dto.fieldGoalsAttempted,
			blocks: dto.blocks,
			steals: dto.steals,
			threesMade: dto.threesMade,
			threesAttempted: dto.threesAttempted,
			freeThrowsMade: dto.freeThrowsMade,
			freeThrowsAttempted: dto.freeThrowsAttempted,
			points: dto.points,
			turnovers: dto.turnovers,
			fouls: dto.fouls,
			plusOrMinus: dto.plusOrMinus,
			eff: dto.eff,
			technicalFouls: dto.technicalFouls,
			onCourt: dto.onCourt ? 1 : 0,
			playerHidden: dto.playerHidden ?? false ? 1 : 0,
			syncState: dto.syncState
		}
	}

	async find(id: {playerId: number, gameId: number}): Promise<Stat> {
    const stats = await this.db.select<StatEntity[]>(`
			SELECT * FROM stats WHERE playerId = $1 AND gameId = $2`, [id.playerId, id.gameId]);
    return this.mapDbToDto(stats[0]);
	}


	async getAll(): Promise<Stat[]> {
		const stats = await this.db.select<StatEntity[]>('select * from stats');
		return stats.map(this.mapDbToDto);
	}

	async add(model: Stat): Promise<void> {
    const entity = this.mapDtoToDb(model);
    await this.db.execute(`
			INSERT INTO stats (
				gameId, playerId, minutes, assists, defensiveRebounds, offensiveRebounds,
				fieldGoalsMade, fieldGoalsAttempted, blocks, steals, threesMade,
				threesAttempted, freeThrowsMade, freeThrowsAttempted, turnovers, fouls,
				plusOrMinus, technicalFouls, onCourt, playerHidden, syncState
			) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)`, [
			entity.gameId, entity.playerId, entity.minutes, entity.assists, entity.defensiveRebounds, entity.offensiveRebounds,
			entity.fieldGoalsMade, entity.fieldGoalsAttempted, entity.blocks, entity.steals, entity.threesMade,
			entity.threesAttempted, entity.freeThrowsMade, entity.freeThrowsAttempted, entity.turnovers, entity.fouls,
			entity.plusOrMinus, entity.technicalFouls, entity.onCourt, entity.playerHidden, entity.syncState
    ]);
	}

	async delete(id: {playerId: number, gameId: number}): Promise<void> {
    await this.db.execute(`
			DELETE FROM stats
			WHERE playerId = $1 AND gameId = $2`, [id.playerId, id.gameId]);
	}

	async update(model: Stat): Promise<void> {
    const entity = this.mapDtoToDb(model);
    await this.db.execute(`
			UPDATE stats
			SET
				minutes = $3, assists = $4, defensiveRebounds = $5, offensiveRebounds = $6,
				fieldGoalsMade = $7, fieldGoalsAttempted = $8, blocks = $9, steals = $10,
				threesMade = $11, threesAttempted = $12, freeThrowsMade = $13,
				freeThrowsAttempted = $14, turnovers = $15, fouls = $16, plusOrMinus = $17,
				technicalFouls = $18, onCourt = $19, playerHidden = $20, syncState = $21
			WHERE gameId = $1 AND playerId = $2`, [
			entity.gameId, entity.playerId, entity.minutes, entity.assists, entity.defensiveRebounds, entity.offensiveRebounds,
			entity.fieldGoalsMade, entity.fieldGoalsAttempted, entity.blocks, entity.steals, entity.threesMade,
			entity.threesAttempted, entity.freeThrowsMade, entity.freeThrowsAttempted, entity.turnovers, entity.fouls,
			entity.plusOrMinus, entity.technicalFouls, entity.onCourt, entity.playerHidden, entity.syncState
    ]);
	}

	async bulkAdd(models: Stat[]): Promise<void> {
    if (models.length === 0) {
			return;
		}

    const placeholders = models.map((_, index) =>`(
			$${index * 21 + 1}, $${index * 21 + 2}, $${index * 21 + 3}, $${index * 21 + 4}, $${index * 21 + 5},
			$${index * 21 + 6}, $${index * 21 + 7}, $${index * 21 + 8}, $${index * 21 + 9}, $${index * 21 + 10},
			$${index * 21 + 11}, $${index * 21 + 12}, $${index * 21 + 13}, $${index * 21 + 14}, $${index * 21 + 15},
			$${index * 21 + 16}, $${index * 21 + 17}, $${index * 21 + 18}, $${index * 21 + 19}, $${index * 21 + 20},
			$${index * 21 + 21})`).join(', ');

    const values = models.flatMap(model => this.mapDtoToDb(model));
    const flatValues = values.flatMap(entity => [
        entity.gameId, entity.playerId, entity.minutes, entity.assists, entity.defensiveRebounds, entity.offensiveRebounds,
        entity.fieldGoalsMade, entity.fieldGoalsAttempted, entity.blocks, entity.steals, entity.threesMade,
        entity.threesAttempted, entity.freeThrowsMade, entity.freeThrowsAttempted, entity.turnovers, entity.fouls,
        entity.plusOrMinus, entity.technicalFouls, entity.onCourt, entity.playerHidden, entity.syncState
    ]);

    await this.db.execute(`
			INSERT INTO stats (
				gameId, playerId, minutes, assists, defensiveRebounds, offensiveRebounds,
				fieldGoalsMade, fieldGoalsAttempted, blocks, steals, threesMade,
				threesAttempted, freeThrowsMade, freeThrowsAttempted, turnovers, fouls,
				plusOrMinus, technicalFouls, onCourt, playerHidden, syncState
			) VALUES ${placeholders}`, flatValues);
	}

	async getByGame(gameId: number): Promise<Stat[]> {
		const stats = await this.db.select<StatEntity[]>(`
			SELECT *
			FROM stats
			WHERE gameId = $1`, [gameId]);
		return stats.map(this.mapDbToDto);
	}
}

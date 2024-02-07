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
			select 	*
			from 		stats
			where 	playerId = ${id.playerId}
			and 		gameId = ${id.gameId}`);
		const stat = stats[0];
		return this.mapDbToDto(stat);
	}

	async getAll(): Promise<Stat[]> {
		const stats = await this.db.select<StatEntity[]>('select * from stats');
		return stats.map(this.mapDbToDto);
	}

	async add(model: Stat): Promise<void> {
    const entity = this.mapDtoToDb(model);
    await this.db.execute(`
			INSERT INTO stats (
				gameId,
				playerId,
				minutes,
				assists,
				rebounds,
				defensiveRebounds,
				offensiveRebounds,
				fieldGoalsMade,
				fieldGoalsAttempted,
				blocks,
				steals,
				threesMade,
				threesAttempted,
				freeThrowsMade,
				freeThrowsAttempted,
				points,
				turnovers,
				fouls,
				plusOrMinus,
				eff,
				technicalFouls,
				onCourt,
				playerHidden,
				syncState
			) VALUES (
				${entity.gameId},
				${entity.playerId},
				${entity.minutes},
				${entity.assists},
				${entity.rebounds},
				${entity.defensiveRebounds},
				${entity.offensiveRebounds},
				${entity.fieldGoalsMade},
				${entity.fieldGoalsAttempted},
				${entity.blocks},
				${entity.steals},
				${entity.threesMade},
				${entity.threesAttempted},
				${entity.freeThrowsMade},
				${entity.freeThrowsAttempted},
				${entity.points},
				${entity.turnovers},
				${entity.fouls},
				${entity.plusOrMinus},
				${entity.eff},
				${entity.technicalFouls},
				${entity.onCourt},
				${entity.playerHidden},
				${entity.syncState}
			);`);
	}

	async delete(id: {playerId: number, gameId: number}): Promise<void> {
		await this.db.execute(`
			delete 	*
			from 		stats
			where 	playerId = ${id.playerId}
			and 		gameId = ${id.gameId}`);
	}

	async update(model: Stat): Promise<void> {
    const entity = this.mapDtoToDb(model);

    await this.db.execute(`
			UPDATE stats
			SET
				gameId = ${entity.gameId},
				playerId = ${entity.playerId},
				minutes = ${entity.minutes},
				assists = ${entity.assists},
				rebounds = ${entity.rebounds},
				defensiveRebounds = ${entity.defensiveRebounds},
				offensiveRebounds = ${entity.offensiveRebounds},
				fieldGoalsMade = ${entity.fieldGoalsMade},
				fieldGoalsAttempted = ${entity.fieldGoalsAttempted},
				blocks = ${entity.blocks},
				steals = ${entity.steals},
				threesMade = ${entity.threesMade},
				threesAttempted = ${entity.threesAttempted},
				freeThrowsMade = ${entity.freeThrowsMade},
				freeThrowsAttempted = ${entity.freeThrowsAttempted},
				points = ${entity.points},
				turnovers = ${entity.turnovers},
				fouls = ${entity.fouls},
				plusOrMinus = ${entity.plusOrMinus},
				eff = ${entity.eff},
				technicalFouls = ${entity.technicalFouls},
				onCourt = ${entity.onCourt},
				playerHidden = ${entity.playerHidden},
				syncState = ${entity.syncState}
			WHERE
				gameId = ${entity.gameId} AND playerId = ${entity.playerId}`);
	}

	async bulkAdd(models: Stat[]): Promise<void> {
    if (models.length === 0) {
        return;
    }

    const entities = models.map(model => this.mapDtoToDb(model));

    const valuesClause = entities.map(entity => `(
			${entity.gameId},
			${entity.playerId},
			${entity.minutes},
			${entity.assists},
			${entity.rebounds},
			${entity.defensiveRebounds},
			${entity.offensiveRebounds},
			${entity.fieldGoalsMade},
			${entity.fieldGoalsAttempted},
			${entity.blocks},
			${entity.steals},
			${entity.threesMade},
			${entity.threesAttempted},
			${entity.freeThrowsMade},
			${entity.freeThrowsAttempted},
			${entity.points},
			${entity.turnovers},
			${entity.fouls},
			${entity.plusOrMinus},
			${entity.eff},
			${entity.technicalFouls},
			${entity.onCourt},
			${entity.playerHidden},
			${entity.syncState})`).join(', ');

    await this.db.execute(`
			INSERT INTO stats (
				gameId,
				playerId,
				minutes,
				assists,
				rebounds,
				defensiveRebounds,
				offensiveRebounds,
				fieldGoalsMade,
				fieldGoalsAttempted,
				blocks,
				steals,
				threesMade,
				threesAttempted,
				freeThrowsMade,
				freeThrowsAttempted,
				points,
				turnovers,
				fouls,
				plusOrMinus,
				eff,
				technicalFouls,
				onCourt,
				playerHidden,
				syncState
			) VALUES ${valuesClause};`);
	}


	async getByGame(gameId: number): Promise<Stat[]> {
		const stats = await this.db.select<StatEntity[]>(`
			SELECT 		*
			FROM 			stats
			WHERE 		gameId = ${gameId}`);
		return stats.map(this.mapDbToDto);
	}
}

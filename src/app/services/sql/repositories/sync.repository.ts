import { SyncHistory, SyncEntity } from "src/app/interfaces/entities";
import { Repository } from "./repository.interface";
import Database from "tauri-plugin-sql-api";

export class SyncRepository implements Repository<SyncEntity, SyncHistory, number> {
	private db: Database;

	constructor(db: Database) {
		this.db = db;
	}

	mapDbToDto = (entity: SyncEntity): SyncHistory => {
		return {
			id: entity.id,
			dateOccurred: entity.dateOccurred,
			playsSynced: entity.playsSynced == 1 ? true : false,
			playersSynced: entity.playersSynced == 1 ? true : false,
			gamesSynced: entity.gamesSynced == 1 ? true : false,
			statsSynced: entity.statsSynced == 1 ? true : false,
			errorMessages: JSON.parse(entity.errorMessages)
		}
	}

	mapDtoToDb = (dto: SyncHistory): SyncEntity => {
		return {
			id: dto.id,
			dateOccurred: dto.dateOccurred,
			playsSynced: dto.playsSynced == true ? 1 : 0,
			playersSynced: dto.playersSynced == true ? 1 : 0,
			gamesSynced: dto.gamesSynced == true ? 1 : 0,
			statsSynced: dto.statsSynced == true ? 1 : 0,
			errorMessages: JSON.stringify(dto.errorMessages)
		}
	}

	async find(id: number): Promise<SyncHistory> {
		var syncs = await this.db.select<SyncEntity[]>(`
			SELECT    *
			FROM      syncHistory
			WHERE     id = ${id}`);
		return this.mapDbToDto(syncs[0]);
	}

	async getAll(): Promise<SyncHistory[]> {
		var syncs = await this.db.select<SyncEntity[]>(`
			SELECT    *
			FROM      syncHistory`);
		return syncs.map(this.mapDbToDto);
	}

	async add(model: SyncHistory): Promise<void> {
		const entity = this.mapDtoToDb(model);
		const result = await this.db.execute(`
			INSERT INTO syncHistory (
				dateOccurred,
				playsSynced,
				playersSynced,
				gamesSynced,
				statsSynced,
				errorMessages
			) VALUES (
				'${entity.dateOccurred}',
				${entity.playsSynced},
				${entity.playersSynced},
				${entity.gamesSynced},
				${entity.statsSynced},
				'${entity.errorMessages}'
			);`);
			model.id = result.lastInsertId;
	}

	async delete(id: number): Promise<void> {
		await this.db.execute(`
			DELETE FROM syncHistory
			WHERE id = ${id}`);
	}

	async update(model: SyncHistory): Promise<void> {
		const entity = this.mapDtoToDb(model);

		this.db.execute(`
			UPDATE syncHistory
			SET
				dateOccurred = '${entity.dateOccurred}',
				playsSynced = ${entity.playsSynced},
				playersSynced = ${entity.playersSynced},
				gamesSynced = ${entity.gamesSynced},
				statsSynced = ${entity.statsSynced},
				errorMessages = '${entity.errorMessages}'
			WHERE
				id = ${entity.id}`);
	}

	async bulkAdd(models: SyncHistory[]): Promise<void> {
    if (models.length === 0) {
			return;
    }

    const entities = models.map(model => this.mapDtoToDb(model));

		const valuesClause = entities.map(entity => `(
			'${entity.dateOccurred}',
			${entity.playsSynced},
			${entity.playersSynced},
			${entity.gamesSynced},
			${entity.statsSynced},
			'${entity.errorMessages}')`).join(', ');

			await this.db.execute(
				`INSERT INTO syncHistory (
					dateOccurred,
					playsSynced,
					playersSynced,
					gamesSynced,
					statsSynced,
					errorMessages
				) VALUES ${valuesClause}`);
	}
}

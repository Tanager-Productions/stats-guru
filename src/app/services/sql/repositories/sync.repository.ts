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
			SELECT *
			FROM syncHistory
			WHERE id = $1`, [id]);
    return this.mapDbToDto(syncs[0]);
	}

	async getAll(): Promise<SyncHistory[]> {
		var syncs = await this.db.select<SyncEntity[]>(`
			SELECT *
			FROM syncHistory`);
		return syncs.map(this.mapDbToDto);
	}

	async add(model: SyncHistory): Promise<void> {
    const entity = this.mapDtoToDb(model);
    const sql = `
			INSERT INTO syncHistory (
				dateOccurred, playsSynced, playersSynced, gamesSynced, statsSynced, errorMessages
			) VALUES ($1, $2, $3, $4, $5, $6)`;
    const values = [
			entity.dateOccurred, entity.playsSynced, entity.playersSynced,
			entity.gamesSynced, entity.statsSynced, entity.errorMessages
    ];
    const result = await this.db.execute(sql, values);
    model.id = result.lastInsertId;
	}

	async delete(id: number): Promise<void> {
		await this.db.execute(`
			DELETE FROM syncHistory WHERE id = $1`, [id]);
	}

	async update(model: SyncHistory): Promise<void> {
    const entity = this.mapDtoToDb(model);
    const sql = `
			UPDATE
				syncHistory
			SET
				dateOccurred = $1,
				playsSynced = $2,
				playersSynced = $3,
				gamesSynced = $4,
				statsSynced = $5,
				errorMessages = $6
			WHERE
				id = $7`;
    const values = [
			entity.dateOccurred, entity.playsSynced, entity.playersSynced,
			entity.gamesSynced, entity.statsSynced, entity.errorMessages, entity.id
    ];
    await this.db.execute(sql, values);
	}

	async bulkAdd(models: SyncHistory[]): Promise<void> {
    if (models.length === 0) {
			return;
    }

    const placeholders = models.map((_, index) => `(
			$${index * 6 + 1}, $${index * 6 + 2}, $${index * 6 + 3},
			$${index * 6 + 4}, $${index * 6 + 5}, $${index * 6 + 6})`).join(', ');
    const values = models.flatMap(model => [
			this.mapDtoToDb(model).dateOccurred, model.playsSynced, model.playersSynced,
			model.gamesSynced, model.statsSynced, model.errorMessages
    ]);

    const sql = `
			INSERT INTO syncHistory (
				dateOccurred, playsSynced, playersSynced, gamesSynced, statsSynced, errorMessages
			) VALUES ${placeholders}`;
    await this.db.execute(sql, values);
	}
}

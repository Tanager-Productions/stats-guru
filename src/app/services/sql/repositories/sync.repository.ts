import { SyncHistory } from "src/app/interfaces/syncHistory.interface";
import { Repository } from "./repository.interface";
import Database from "tauri-plugin-sql-api";

export class SyncRepository implements Repository<SyncHistory, number> {
	private db: Database;

	constructor(db: Database) {
		this.db = db;
	}

	async find(id: number): Promise<SyncHistory> {
		var syncs: SyncHistory[] = (await this.db.select(`select * from syncHistory where id = '${id}'`));
		return syncs[0];
	}

	async getAll(): Promise<SyncHistory[]> {
		var syncs: SyncHistory[] = (await this.db.select(`select * from syncHistory`));
		return syncs;
	}

	async add(model: SyncHistory): Promise<number> {
		const result = await this.db.execute(
			"INSERT into syncHistory (id, dateOccurred, playsSynced, playersSynced, gamesSynced, statsSynced, errorMessages) VALUES ($1, $2, $3, $4, $5, $6, $7)",
			[ model.id,
				model.dateOccurred,
				model.playsSynced,
				model.playersSynced,
				model.gamesSynced,
				model.statsSynced,
				model.errorMessages
			]
	 );
	 return result.rowsAffected;
	}

	delete(id: number): Promise<void> {
		const result = this.db.execute(`delete * from syncHistory where id = '${id}'`);
		return result.then(res => console.log(res));
	}

	update(model: SyncHistory): Promise<void> {
		const result = this.db.execute(
			"UPDATE syncHistory SET dateOccurred = $1, playsSynced = $2, playersSynced = $3, gamesSynced = $4, statsSynced = $5, errorMessages = $6, WHERE id = $7",
			[ model.dateOccurred, model.playsSynced, model.playersSynced, model.gamesSynced, model.statsSynced, model.errorMessages, model.id ]
		);
		return result.then(res => console.log(res));
	}

	async bulkAdd(models: SyncHistory[]): Promise<void> {
		for(const model of models) {
			await this.db.execute(
				"INSERT into syncHistory (id, dateOccurred, playsSynced, playersSynced, gamesSynced, statsSynced, errorMessages) VALUES ($1, $2, $3, $4, $5, $6, $7)",
				[ model.id,
					model.dateOccurred,
					model.playsSynced,
					model.playersSynced,
					model.gamesSynced,
					model.statsSynced,
					model.errorMessages
				]
		 );
		}
	}
}

import { SyncHistory } from "src/app/interfaces/syncHistory.interface";
import { Repository } from "./repository.interface";
import Database from "tauri-plugin-sql-api";

export class SyncRepository implements Repository<SyncHistory, number> {
	private db: Database;

	constructor(db: Database) {
		this.db = db;
	}

	find(id: number): Promise<SyncHistory> {
		throw new Error("Method not implemented.");
	}

	getAll(): Promise<SyncHistory[]> {
		throw new Error("Method not implemented.");
	}

	add(model: SyncHistory): Promise<number> {
		throw new Error("Method not implemented.");
	}

	delete(id: number): Promise<void> {
		throw new Error("Method not implemented.");
	}

	update(model: SyncHistory): Promise<void> {
		throw new Error("Method not implemented.");
	}

	bulkAdd(models: SyncHistory[]): Promise<void> {
		throw new Error("Method not implemented.");
	}
}

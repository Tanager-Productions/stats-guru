import { Season } from "src/app/interfaces/models";
import { Repository } from "./repository.interface";
import Database from "tauri-plugin-sql-api";

export class SeasonsRepository implements Repository<Season, number> {
	private db: Database;

	constructor(db: Database) {
		this.db = db;
	}

	find(id: number): Promise<Season> {
		throw new Error("Method not implemented.");
	}

	getAll(): Promise<Season[]> {
		throw new Error("Method not implemented.");
	}

	add(model: Season): Promise<number> {
		throw new Error("Method not implemented.");
	}

	delete(id: number): Promise<void> {
		throw new Error("Method not implemented.");
	}

	update(model: Season): Promise<void> {
		throw new Error("Method not implemented.");
	}

	bulkAdd(models: Season[]): Promise<void> {
		throw new Error("Method not implemented.");
	}
}

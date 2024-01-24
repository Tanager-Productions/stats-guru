import { Stat } from "src/app/interfaces/models";
import { Repository } from "./repository.interface";
import Database from "tauri-plugin-sql-api";

export class StatsRepository implements Repository<Stat, number> {
	private db: Database;

	constructor(db: Database) {
		this.db = db;
	}

	find(id: number): Promise<Stat> {
		throw new Error("Method not implemented.");
	}

	getAll(): Promise<Stat[]> {
		throw new Error("Method not implemented.");
	}

	add(model: Stat): Promise<number> {
		throw new Error("Method not implemented.");
	}

	delete(id: number): Promise<void> {
		throw new Error("Method not implemented.");
	}

	update(model: Stat): Promise<void> {
		throw new Error("Method not implemented.");
	}

	bulkAdd(models: Stat[]): Promise<void> {
		throw new Error("Method not implemented.");
	}

	getByGame(gameId: number): Promise<Stat[]> {
		throw new Error("Method not implemented.");
	}
}

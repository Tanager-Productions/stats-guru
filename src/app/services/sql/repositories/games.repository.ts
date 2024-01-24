import Database from "tauri-plugin-sql-api";
import { Repository } from "./repository.interface";
import { Game } from "src/app/interfaces/models";

export class GamesRepository implements Repository<Game, number> {
	private db: Database;

	constructor(db: Database) {
		this.db = db;
	}

	getAll(): Promise<Game[]> {
		throw new Error("Method not implemented.");
	}

	find(id: number): Promise<Game> {
		throw new Error("Method not implemented.");
	}

	add(model: Game): Promise<number> {
		throw new Error("Method not implemented.");
	}

	bulkAdd(models: Game[]): Promise<void> {
		throw new Error("Method not implemented.");
	}

	delete(id: number): Promise<void> {
		throw new Error("Method not implemented.");
	}

	update(model: Game): Promise<void> {
		throw new Error("Method not implemented.");
	}
}

import { Play } from "src/app/interfaces/models";
import { Repository } from "./repository.interface";
import Database from "tauri-plugin-sql-api";

export class PlaysRepository implements Repository<Play, number> {
	private db: Database;

	constructor(db: Database) {
		this.db = db;
	}

	find(id: number): Promise<Play> {
		throw new Error("Method not implemented.");
	}

	getAll(): Promise<Play[]> {
		throw new Error("Method not implemented.");
	}

	add(model: Play): Promise<number> {
		throw new Error("Method not implemented.");
	}

	delete(id: number): Promise<void> {
		throw new Error("Method not implemented.");
	}

	update(model: Play): Promise<void> {
		throw new Error("Method not implemented.");
	}

	bulkAdd(models: Play[]): Promise<void> {
		throw new Error("Method not implemented.");
	}

	getByGame(gameId: number): Promise<Play[]> {
		return this.db.select<Play[]>(`
			SELECT 		*
			FROM 			plays
			WHERE 		gameId = ${gameId}
			AND				syncState != 3
			ORDER BY	playOrder DESC
		`);
	}
}

import { Game, Player } from "src/app/interfaces/models";
import { Repository } from "./repository.interface";
import Database from "tauri-plugin-sql-api";

export class PlayersRepository implements Repository<Player, number> {
	private db: Database;

	constructor(db: Database) {
		this.db = db;
	}

	find(id: number): Promise<Player> {
		throw new Error("Method not implemented.");
	}

	getAll(): Promise<Player[]> {
		throw new Error("Method not implemented.");
	}

	add(model: Player): Promise<number> {
		throw new Error("Method not implemented.");
	}

	delete(id: number): Promise<void> {
		throw new Error("Method not implemented.");
	}

	update(model: Player): Promise<void> {
		throw new Error("Method not implemented.");
	}

	bulkAdd(models: Player[]): Promise<void> {
		throw new Error("Method not implemented.");
	}

	getByGame(game: Game): Promise<Player[]> {
		return this.db.select<Player[]>(`
			SELECT 		*
			FROM 			players
			WHERE 		teamId = ${game.homeTeamId}
			OR				teamId = ${game.awayTeamId}
		`);
	}
}

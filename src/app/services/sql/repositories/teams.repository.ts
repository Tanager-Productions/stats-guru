import Database from "tauri-plugin-sql-api";
import { Repository } from "./repository.interface";
import { Team } from "src/app/interfaces/models";

export class TeamsRepository implements Repository<Team, number> {
	private db: Database;

	constructor(db: Database) {
		this.db = db;
	}

	find(id: number): Promise<Team> {
		throw new Error("Method not implemented.");
	}

	getAll(): Promise<Team[]> {
		throw new Error("Method not implemented.");
	}

	add(model: Team): Promise<number> {
		throw new Error("Method not implemented.");
	}

	delete(id: number): Promise<void> {
		throw new Error("Method not implemented.");
	}

	update(model: Team): Promise<void> {
		throw new Error("Method not implemented.");
	}

	bulkAdd(models: Team[]): Promise<void> {
		throw new Error("Method not implemented.");
	}

	async hasTeamPlayer(id: number): Promise<boolean> {
		let results: {count: number}[] = await this.db.select(`
			select 	count(id) as count
			from 		players p
			where 	p.firstName = 'team'
			and 		p.lastName = 'team'
			and 		p.teamId == ${id}
		`);
		return results[0].count == 0;
	}
}

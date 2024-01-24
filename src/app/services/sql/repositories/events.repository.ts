import { Event } from "src/app/interfaces/models";
import { Repository } from "./repository.interface";
import Database from "tauri-plugin-sql-api";

export class EventsRepository implements Repository<Event, number> {
	private db: Database;

	constructor(db: Database) {
		this.db = db;
	}

	find(id: number): Promise<Event> {
		throw new Error("Method not implemented.");
	}

	getAll(): Promise<Event[]> {
		throw new Error("Method not implemented.");
	}

	add(model: Event): Promise<number> {
		throw new Error("Method not implemented.");
	}

	delete(id: number): Promise<void> {
		throw new Error("Method not implemented.");
	}

	update(model: Event): Promise<void> {
		throw new Error("Method not implemented.");
	}

	bulkAdd(models: Event[]): Promise<void> {
		throw new Error("Method not implemented.");
	}
}

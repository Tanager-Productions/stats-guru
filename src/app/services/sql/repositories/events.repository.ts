import { Event as dbEvent } from "src/app/interfaces/entities";
import { Repository } from "./repository.interface";
import Database from "tauri-plugin-sql-api";
import { Event } from "@tanager/tgs";
import { SyncState } from "src/app/interfaces/syncState.enum";
export class EventsRepository implements Repository<Event, number> {
	private db: Database;

	constructor(db: Database) {
		this.db = db;
	}

	async find(id: number): Promise<Event> {
		var dbEvent: dbEvent[] = (await this.db.select(`select * from events where id = '${id}'`));
		var event: Event = {
			id: dbEvent[0].id,
			startDate: dbEvent[0].startDate,
			endDate: dbEvent[0].endDate,
			state: dbEvent[0].state,
			title: dbEvent[0].title,
			city: dbEvent[0].city,
			picture: dbEvent[0].picture,
			type:  dbEvent[0].type,
		}
		return event;
	}

	async getAll(): Promise<Event[]> {
		var dbEvents: dbEvent[] = (await this.db.select(`select * from events`));
		return dbEvents.map(obj => ({
			id: obj.id,
			startDate: obj.startDate,
			endDate: obj.endDate,
			state: obj.state,
			title: obj.title,
			city: obj.city,
			picture: obj.picture,
			type: obj.type,
		}));
	}

	async add(model: Event): Promise<number> {
		const result = await this.db.execute(
			`INSERT into events (id, startDate, endDate, state, title, city, picture, type ) VALUES ('${model.id}', '${model.startDate}', '${model.endDate}', '${model.state}', '${model.title}', '${model.city}', '${model.picture}', '${SyncState.Added}')`,
	 );
	 return result.rowsAffected;
	}

	delete(id: number): Promise<void> {
		const result = this.db.execute(`delete * from events where id = '${id}'`);
		return result.then((res:any) => console.log(res));
	}

	update(model: Event): Promise<void> {
		const result = this.db.execute(
			`UPDATE events SET startDate = '${model.startDate}', endDate = '${model.endDate}', state = '${model.state}', title = '${model.title}', city = '${model.city}', picture = '${model.picture}', type = '${model.type}' WHERE id = '${model.id}'`,
		);
		return result.then((res:any) => console.log(res));
	}

	async bulkAdd(models: Event[]): Promise<void> {
		const dbEvents : dbEvent[] = models.map(obj => ({
			id: obj.id,
			startDate: obj.startDate,
			endDate: obj.endDate,
			state: obj.state,
			title: obj.title,
			city: obj.city,
 			picture: obj.picture,
			type: obj.type
		}));

		for(const model of dbEvents) {
			await this.db.execute(
				`INSERT into events (id, startDate, endDate, state, title, city, picture, type ) VALUES ('${model.id}', '${model.startDate}', '${model.endDate}', '${model.state}', '${model.title}', '${model.city}', '${model.picture}', '${model.type}')`,
		 );
		}
	}
}

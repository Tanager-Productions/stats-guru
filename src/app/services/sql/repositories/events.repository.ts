import { EventEntity } from "src/app/interfaces/entities";
import { Repository } from "./repository.interface";
import Database from "tauri-plugin-sql-api";
import { Event } from "@tanager/tgs";

export class EventsRepository implements Repository<EventEntity, Event, number> {
	private db: Database;

	constructor(db: Database) {
		this.db = db;
	}

	mapDbToDto = (entity: EventEntity): Event => {
		return {
			id: entity.id,
			startDate: entity.startDate,
			endDate: entity.endDate,
			state: entity.state,
			title: entity.title,
			city: entity.city,
			picture: entity.city,
			type: entity.type
		};
	}

	mapDtoToDb = (dto: Event): EventEntity => {
		return {
			id: dto.id,
			startDate: dto.startDate,
			endDate: dto.endDate,
			state: dto.state,
			title: dto.title,
			city: dto.city,
			picture: dto.city,
			type: dto.type
		};
	}

	async find(id: number): Promise<Event> {
		var events = await this.db.select<EventEntity[]>(`
			SELECT 	*
			FROM 		events
			WHERE 	id = ${id}`);
		return events[0];
	}

	async getAll(): Promise<Event[]> {
		var events = await this.db.select<EventEntity[]>(`
			SELECT 	*
			FROM 		events`);
		return events.map(this.mapDbToDto);
	}

	async add(model: Event): Promise<void> {
		const entity = this.mapDtoToDb(model);
		const result = await this.db.execute(
			`INSERT INTO events (
				startDate,
				endDate,
				state,
				title,
				city,
				picture,
				type
			) VALUES (
				'${model.startDate}',
				'${model.endDate},
				${model.state ? `'${model.state}'` : null},
				'${model.title}',
				${model.city ? `'${model.city}'` : null},
				${model.picture ? `'${model.picture}'` : null},
				${model.type}
			);`,);
		model.id = result.lastInsertId;
	}

	async delete(id: number): Promise<void> {
		await this.db.execute(`
			DELETE FROM events
			WHERE id = ${id}`);
	}

	async update(model: Event): Promise<void> {
		const entity = this.mapDtoToDb(model);
		await this.db.execute(`
			UPDATE events
			SET
				startDate = '${entity.startDate}',
				endDate = '${entity.endDate}',
				state = ${entity.state ? `'${entity.state}'` : null},
				title = '${entity.title}',
				city = ${entity.city ? `'${entity.city}'` : null},
				picture = ${entity.picture ? `'${entity.picture}'` : null},
				type = ${entity.type}
			WHERE id = ${entity.id}`);
	}

	async bulkAdd(models: Event[]): Promise<void> {
		if (models.length === 0) {
			return;
    }

    const entities = models.map(model => this.mapDtoToDb(model));

		const valuesClause = entities.map(entity => `(
			'${entity.startDate}',
			'${entity.endDate}',
			${entity.state ? `'${entity.state}'` : null},
			'${entity.title}',
			${entity.city ? `'${entity.city}'` : null},
			${entity.picture ? `'${entity.picture}'` : null},
			${entity.type})`).join(', ');

		await this.db.execute(`
			INSERT INTO events (
				startDate,
				endDate,
				state,
				title,
				city,
				picture,
				type
			)VALUES ${valuesClause};`);
	}
}

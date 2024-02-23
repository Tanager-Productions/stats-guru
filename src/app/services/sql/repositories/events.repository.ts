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
		const events = await this.db.select<EventEntity[]>(`
        SELECT *
        FROM events
        WHERE id = $1`, [id]);
		return this.mapDbToDto(events[0]);
	}

	async getAll(): Promise<Event[]> {
		var events = await this.db.select<EventEntity[]>(`
			SELECT 		*
			FROM 			events
			ORDER BY 	title ASC`);
		return events.map(this.mapDbToDto);
	}

	async add(model: Event): Promise<void> {
		const sql = `
			INSERT INTO events (
				startDate, endDate, state, title, city, picture, type
			) VALUES ($1, $2, $3, $4, $5, $6, $7)`;
		const values = [
			model.startDate, model.endDate, model.state, model.title,
			model.city, model.picture, model.type
		];
		const result = await this.db.execute(sql, values);
		model.id = result.lastInsertId;
	}

	async delete(id: number): Promise<void> {
		await this.db.execute(`
			DELETE FROM events WHERE id = $1`, [id]);
	}

	async update(model: Event): Promise<void> {
    const sql = `
			UPDATE
				events
			SET
				startDate = $1,
				endDate = $2,
				state = $3,
				title = $4,
				city = $5,
				picture = $6,
				type = $7
			WHERE
				id = $8`;
    const values = [
			model.startDate, model.endDate, model.state, model.title,
			model.city, model.picture, model.type, model.id
    ];
    await this.db.execute(sql, values);
	}

	async bulkAdd(models: Event[]): Promise<void> {
    if (models.length === 0) {
			return;
    }

    const placeholders = models.map((_, i) => `(
			$${i * 7 + 1}, $${i * 7 + 2}, $${i * 7 + 3}, $${i * 7 + 4},
			$${i * 7 + 5}, $${i * 7 + 6}, $${i * 7 + 7})`).join(', ');
    const values = models.flatMap(model => [
			model.startDate, model.endDate, model.state,
			model.title, model.city, model.picture, model.type
		]);

    const sql = `
			INSERT INTO events (
				startDate, endDate, state, title, city, picture, type
			) VALUES ${placeholders}`;
    await this.db.execute(sql, values);
	}
}

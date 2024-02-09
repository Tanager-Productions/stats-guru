import { SeasonEntity } from "src/app/interfaces/entities";
import { Repository } from "./repository.interface";
import Database from "tauri-plugin-sql-api";
import { Season } from "@tanager/tgs";

export class SeasonsRepository implements Repository<SeasonEntity, Season, number> {
	private db: Database;

	constructor(db: Database) {
		this.db = db;
	}

	mapDbToDto = (entity: SeasonEntity): Season => {
		return {
			year: entity.year,
			createdOn: entity.createdOn,
			createdBy: entity.createdBy
		};
	}

	mapDtoToDb = (dto: Season): SeasonEntity => {
		return {
			year: dto.year,
			createdOn: dto.createdOn,
			createdBy: dto.createdBy
		};
	}

	async find(id: number): Promise<Season> {
		var seasons = await this.db.select<SeasonEntity[]>(`
			SELECT 			*
			FROM        seasons
			WHERE       year = ${id}`);
		return this.mapDbToDto(seasons[0]);
	}

	async getAll(): Promise<Season[]> {
		var seasons = await this.db.select<SeasonEntity[]>(`
			SELECT 			*
			FROM        seasons`);
		return seasons.map(this.mapDbToDto);
	}

	async add(model: Season): Promise<void> {
		const entity = this.mapDtoToDb(model);
		const result = await this.db.execute(
			`INSERT INTO seasons (
				year,
				createdOn,
				createdBy
			) VALUES (
				${entity.year},
				'${entity.createdOn}',
				${entity.createdBy ? `'${entity.createdBy}'` : null}
			);`);
	}

	async delete(id: number): Promise<void> {
		await this.db.execute(`
			DELETE FROM seasons
			WHERE year = ${id}`);
	}

	async update(model: Season): Promise<void> {
		const entity = this.mapDtoToDb(model);

		await this.db.execute(`
		  UPDATE seasons
			SET
				createdOn =  '${entity.createdOn}',
				createdBy = ${entity.createdBy ? `'${entity.createdBy}'` : null}
			WHERE year = ${entity.year}`);
	}

	async bulkAdd(models: Season[]): Promise<void> {
    if (models.length === 0) {
			return;
    }

    const entities = models.map(model => this.mapDtoToDb(model));

		const valuesClause = entities.map(entity => `(
			${entity.year},
			'${entity.createdOn}',
			${entity.createdBy ? `'${entity.createdBy}'` : null})`).join(', ');

			await this.db.execute(`
				INSERT INTO seasons (
					year,
					createdOn,
					createdBy
				) VALUES ${valuesClause};`);
	}
}

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
			SELECT *
			FROM seasons
			WHERE year = $1`, [id]);
    return this.mapDbToDto(seasons[0]);
	}

	async getAll(): Promise<Season[]> {
		var seasons = await this.db.select<SeasonEntity[]>(`
			SELECT *
			FROM seasons`);
		return seasons.map(this.mapDbToDto);
	}

	async add(model: Season): Promise<void> {
    const sql = `
			INSERT INTO seasons (
				year, createdOn, createdBy
			) VALUES ($1, $2, $3)`;
    const values = [
			model.year, model.createdOn, model.createdBy
    ];
    await this.db.execute(sql, values);
	}

	async delete(id: number): Promise<void> {
		await this.db.execute(`
			DELETE FROM seasons WHERE year = $1`, [id]);
	}

	async update(model: Season): Promise<void> {
    const sql = `
        UPDATE
					seasons
        SET
					createdOn = $2,
					createdBy = $3
        WHERE
					year = $1`;
    const values = [
			model.year, model.createdOn, model.createdBy
    ];
    await this.db.execute(sql, values);
	}

	async bulkAdd(models: Season[]): Promise<void> {
    if (models.length === 0) {
			return;
    }

    const placeholders = models.map((_, index) => `(
			$${index * 3 + 1}, $${index * 3 + 2}, $${index * 3 + 3})`).join(', ');
    const values = models.flatMap(model => [model.year, model.createdOn, model.createdBy]);

    const sql = `
			INSERT INTO seasons (
				year, createdOn, createdBy
			) VALUES ${placeholders}`;
    await this.db.execute(sql, values);
}

}

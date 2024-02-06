import { Season as dbSeason } from "src/app/interfaces/models";
import { Repository } from "./repository.interface";
import Database from "tauri-plugin-sql-api";
import { Season } from "@tanager/tgs";
export class SeasonsRepository implements Repository<Season, number> {
	private db: Database;

	constructor(db: Database) {
		this.db = db;
	}

	async find(id: number): Promise<Season> {
		var dbSeason:dbSeason[] = (await this.db.select(`select * from seasons where year = '${id}'`));
		var season: Season = {
			year: dbSeason[0].year,
			createdOn: dbSeason[0].createdOn,
			createdBy: dbSeason[0].createdBy
		}
		return season;
	}

	async getAll(): Promise<Season[]> {
		var dbSeasons:dbSeason[] = (await this.db.select(`select * from seasons`));

		return dbSeasons.map(obj => ({
			year: obj.year,
			createdOn: obj.createdOn,
			createdBy: obj.createdBy
		}));
	}

	async add(model: Season): Promise<number> {
		const result = await this.db.execute(
			"INSERT into seasons (year, createdOn, createdBy) VALUES ($1, $2, $3)",
			[ model.year,
				model.createdOn,
				model.createdBy
			]
	 );
	 return result.rowsAffected;
	}

	delete(id: number): Promise<void> {
		const result = this.db.execute(`delete * from seasons where year = '${id}'`);
		return result.then(res => console.log(res));
	}

	update(model: Season): Promise<void> {
		const result = this.db.execute(
			"UPDATE seasons SET createdOn = $2, createdBy = $3 WHERE year = $7",
			[ model.createdOn, model.createdBy, model.year ]
		);
		return result.then(res => console.log(res));
	}

	async bulkAdd(models: Season[]): Promise<void> {
		for(const model of models) {
			await this.db.execute(
				"INSERT into seasons (year, createdOn, createdBy) VALUES ($1, $2, $3)",
				[ model.year,
					model.createdOn,
					model.createdBy
				]
		 );
		}
	}
}

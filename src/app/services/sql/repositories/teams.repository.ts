import Database from "tauri-plugin-sql-api";
import { Repository } from "./repository.interface";
import { Team as dbTeam } from "src/app/interfaces/entities";
import { Team } from "@tanager/tgs";
export class TeamsRepository implements Repository<Team, number> {
	private db: Database;

	constructor(db: Database) {
		this.db = db;
	}

	async find(id: number): Promise<Team> {
		var dbTeam: dbTeam[] = (await this.db.select(`select * from teams where id = '${id}'`));
		var team: Team = {
			id: dbTeam[0].id,
			name: dbTeam[0].name,
			isMale: dbTeam[0].isMale == 1 ? true : false,
			seasonId: dbTeam[0].seasonId,
			city: dbTeam[0].city,
			state: dbTeam[0].state,
			teamType: dbTeam[0].type,
			socialMedias: dbTeam[0].socialMediaString != null? this.socialStringToObject(dbTeam[0].socialMediaString, '-') : null,
			generalInfo: dbTeam[0].infoString != null? this.infoStringToObject(dbTeam[0].infoString, ',') : null,
			division: dbTeam[0].division,
			defaultLogo: dbTeam[0].defaultLogo,
			darkModeLogo: dbTeam[0].darkModeLogo,
		}
		return team;
	}

	async getAll(): Promise<Team[]> {
		var dbTeams:dbTeam[] = (await this.db.select(`select * from teams`));
		return dbTeams.map(obj => ({
			id: obj.id,
			name: obj.name,
			isMale: obj.isMale == 1 ? true : false,
			seasonId: obj.seasonId,
			city: obj.city,
			state: obj.state,
			teamType: obj.type,
			socialMedias: obj.socialMediaString != null? this.socialStringToObject(obj.socialMediaString, '-') : null,
			generalInfo: obj.infoString != null? this.infoStringToObject(obj.infoString, ',') : null,
			division: obj.division,
			defaultLogo: obj.defaultLogo,
			darkModeLogo: obj.darkModeLogo,
		}));
	}

	async add(model: Team): Promise<number> {
		const result = await this.db.execute(
			"INSERT into teams (id, name, isMale, seasonId, city, state, type, socialMediaString, infoString, division, defaultLogo, darkModeLogo) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)",
			[ model.id,
				model.name,
				model.isMale,
				model.seasonId,
				model.city,
				model.state,
				model.teamType,
				model.socialMedias,
				model.generalInfo,
				model.division,
				model.defaultLogo,
				model.darkModeLogo
			]
	 );
	 return result.rowsAffected;
	}

	delete(id: number): Promise<void> {
		const result = this.db.execute(`delete * from teams where id = '${id}'`);
		return result.then(res => console.log(res));
	}

	update(model: Team): Promise<void> {
		const result = this.db.execute(
			"UPDATE teams SET name = $1, isMale = $2, seasonId = $3, city = $4, state = $5, type = $6, isMale = $7, socialMediaString = $8, infoString = $9, division = $10, defaultLogo = $11, darkModeLogo = $12 WHERE id = $13",
			[ model.name, model.isMale, model.seasonId, model.city, model.state, model.teamType, model.isMale, model.socialMedias, model.generalInfo, model.division, model.defaultLogo, model.darkModeLogo, model.id ]
		);
		return result.then(res => console.log(res));
	}

	async bulkAdd(models: Team[]): Promise<void> {
		for(const model of models) {
			await this.db.execute(
				"INSERT into teams (id, name, isMale, seasonId, city, state, type, socialMediaString, infoString, division, defaultLogo, darkModeLogo) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)",
				[ model.id,
					model.name,
					model.isMale,
					model.seasonId,
					model.city,
					model.state,
					model.teamType,
					model.socialMedias,
					model.generalInfo,
					model.division,
					model.defaultLogo,
					model.darkModeLogo
				]
		 );
		}
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


  public infoStringToObject(str: string, delimiter: string): { [key: string]: string } {
    str = str.substring(1, str.length - 1);
    const keyValuePairs = str.split(delimiter);
    return keyValuePairs.reduce((acc: { [key: string]: string }, pair: string) => {
        const [key, value] = pair.split(':');
        acc[key.trim()] = value.trim();
        return acc;
    }, {});
	}

	public socialStringToObject(str: string, delimiter: string): { [key: string]: string } {
    const keyValuePairs = str.split(delimiter);
    return keyValuePairs.reduce((acc: { [key: string]: string }, pair: string) => {
        const [key, value] = pair.split(':');
        acc[key.trim()] = value.trim();
        return acc;
    }, {});
	}
}

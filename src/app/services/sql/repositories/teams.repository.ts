import Database from "tauri-plugin-sql-api";
import { Repository } from "./repository.interface";
import { Team as TeamEntity } from "src/app/interfaces/models";
import { Team } from "@tanager/tgs";
import { SyncState } from "src/app/interfaces/syncState.enum";

type sgTeam = {
	team: Team,
	syncState: SyncState
}

export class TeamsRepository implements Repository<sgTeam, number> {
	private db: Database;

	constructor(db: Database) {
		this.db = db;
	}

	private mapDbToDto = (obj: TeamEntity): sgTeam => {
		return {
			team : {
									id: obj.id,
									name: obj.name,
									isMale: obj.isMale == 1 ? true : false,
									seasonId: obj.seasonId,
									city: obj.city,
									state: obj.state,
									teamType: obj.type,
									socialMedias: obj.socialMedias != null ? JSON.parse(obj.socialMedias) : null,
									generalInfo: obj.generalInfo != null ? JSON.parse(obj.generalInfo) : null,
									division: obj.division,
									defaultLogo: obj.defaultLogo,
									darkModeLogo: obj.darkModeLogo
								},
			syncState: SyncState.Unchanged
		}
	}

	private mapDtoToDb = (obj: sgTeam): TeamEntity => {
		return {
			id: obj.team.id,
			name: obj.team.name,
			isMale: obj.team.isMale == true ? 1 : 0,
			seasonId: obj.team.seasonId,
			city: obj.team.city,
			state: obj.team.state,
			type: obj.team.teamType,
			socialMedias: obj.team.socialMedias != null ? JSON.stringify(obj.team.socialMedias) : null,
			generalInfo: obj.team.generalInfo != null ? JSON.stringify(obj.team.generalInfo) : null,
			division: obj.team.division,
			defaultLogo: obj.team.defaultLogo,
			darkModeLogo: obj.team.darkModeLogo
		}
	}

	async find(id: number): Promise<sgTeam> {
		const result = await this.db.select<TeamEntity[]>(`select * from teams where id = '${id}'`);
		const team = result[0];
		return this.mapDbToDto(team);
	}

	async getAll(): Promise<sgTeam[]> {
		const teams = await this.db.select<TeamEntity[]>(`select * from teams`);
		return teams.map(this.mapDbToDto);
	}

	async add(model: sgTeam): Promise<void> {
		const result = await this.db.execute(`
			INSERT
				into
				teams (name,
				isMale,
				seasonId,
				city,
				state,
				type,
				socialMediaString,
				infoString,
				division,
				defaultLogo,
				darkModeLogo)
			VALUES ($1,
			$2,
			$3,
			$4,
			$5,
			$6,
			$7,
			$8,
			$9,
			$10,
			$11)
			`,
			[	model.team.name,
				model.team.isMale,
				model.team.seasonId,
				model.team.city,
				model.team.state,
				model.team.teamType,
				model.team.socialMedias,
				model.team.generalInfo,
				model.team.division,
				model.team.defaultLogo,
				model.team.darkModeLogo
			]
	 );
	 model.team.id = result.lastInsertId;
	}

	async delete(id: number): Promise<void> {
		await this.db.execute(`
			DELETE		*
			FROM	teams
			WHERE id = '${id}'
		`);
	}

	async update(model: sgTeam): Promise<void> {
		await this.db.execute(`
				UPDATE
					teams
				SET
					name = $1,
					isMale = $2,
					seasonId = $3,
					city = $4,
					state = $5,
					type = $6,
					isMale = $7,
					socialMediaString = $8,
					infoString = $9,
					division = $10,
					defaultLogo = $11,
					darkModeLogo = $12
				WHERE
					id = $13
		`,
			[ model.team.name, model.team.isMale, model.team.seasonId, model.team.city, model.team.state, model.team.teamType, model.team.isMale, model.team.socialMedias, model.team.generalInfo, model.team.division, model.team.defaultLogo, model.team.darkModeLogo, model.team.id ]
		);
	}

	async bulkAdd(models: sgTeam[]): Promise<void> {
		const dbTeams: TeamEntity[] = models.map(this.mapDtoToDb);
		await this.db.execute(`
			INSERT
				into
				teams (name,
				isMale,
				seasonId,
				city,
				state,
				type,
				socialMediaString,
				infoString,
				division,
				defaultLogo,
				darkModeLogo)
			VALUES ($1,
			$2,
			$3,
			$4,
			$5,
			$6,
			$7,
			$8,
			$9,
			$10,
			$11)
			`,
			[	dbTeams ]
	 );
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

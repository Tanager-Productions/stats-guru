import Database from "tauri-plugin-sql-api";
import { Repository } from "./repository.interface";
import { TeamEntity } from "src/app/interfaces/entities";
import { Team } from "@tanager/tgs";

export class TeamsRepository implements Repository<TeamEntity, Team, number> {
	private db: Database;

	constructor(db: Database) {
		this.db = db;
	}

	mapDbToDto = (entity: TeamEntity): Team => {
		return {
			id: entity.id,
			name: entity.name,
			isMale: entity.isMale == 1 ? true : false,
			seasonId: entity.seasonId,
			city: entity.city,
			state: entity.state,
			teamType: entity.teamType,
			socialMedias: entity.socialMedias != null ? JSON.parse(entity.socialMedias) : null,
			generalInfo: entity.generalInfo != null ? JSON.parse(entity.generalInfo) : null,
			division: entity.division,
			defaultLogo: entity.defaultLogo,
			darkModeLogo: entity.darkModeLogo
		}
	}

	mapDtoToDb = (dto: Team): TeamEntity => {
		return {
			id: dto.id,
			name: dto.name,
			isMale: dto.isMale == true ? 1 : 0,
			seasonId: dto.seasonId,
			city: dto.city,
			state: dto.state,
			teamType: dto.teamType,
			socialMedias: dto.socialMedias != null ? JSON.stringify(dto.socialMedias) : null,
			generalInfo: dto.generalInfo != null ? JSON.stringify(dto.generalInfo) : null,
			division: dto.division,
			defaultLogo: dto.defaultLogo,
			darkModeLogo: dto.darkModeLogo
		}
	}

	async find(id: number): Promise<Team> {
		const team = await this.db.select<TeamEntity[]>(`
			SELECT 			*
			FROM        teams
			WHERE       id = ${id}`);
		return this.mapDbToDto(team[0]);
	}

	async getAll(): Promise<Team[]> {
		const teams = await this.db.select<TeamEntity[]>(`
			SELECT 			*
			FROM        teams`);
		return teams.map(this.mapDbToDto);
	}

	async add(model: Team): Promise<void> {
		const entity = this.mapDtoToDb(model);
		const result = await this.db.execute(`
			INSERT INTO teams (
				name,
				isMale,
				seasonId,
				city,
				state,
				type,
				socialMedias,
				generalInfo,
				division,
				defaultLogo,
				darkModeLogo
			) VALUES (
				'${entity.name}',
				${entity.isMale},
				${entity.seasonId},
				'${entity.city}',
				'${entity.state}',
				${entity.teamType},
				${entity.socialMedias ? `'${entity.socialMedias}'` : null},
				${entity.generalInfo ? `'${entity.generalInfo}'` : null},
				${entity.division},
				${entity.defaultLogo ? `'${entity.defaultLogo}'` : null},
				${entity.darkModeLogo ? `'${entity.darkModeLogo}'` : null}
			);`);
			model.id = result.lastInsertId;
	}

	async delete(id: number): Promise<void> {
		await this.db.execute(`
			DELETE		*
			FROM	    teams
			WHERE     id = ${id}`);
	}

	async update(model: Team): Promise<void> {
		const entity = this.mapDtoToDb(model);
		await this.db.execute(`
				UPDATE
					teams
				SET
					name = '${entity.name}',
					isMale = ${entity.isMale},
					seasonId = ${entity.seasonId},
					city = '${entity.city}',
					state = '${entity.state}',
					type = ${entity.teamType},
					isMale = ${entity.isMale},
					socialMedias = ${entity.socialMedias ? `'${entity.socialMedias}'` : null},
					generalInfo = ${entity.generalInfo ? `'${entity.generalInfo}'` : null},
					division = ${entity.division},
					defaultLogo = ${entity.defaultLogo ? `'${entity.defaultLogo}'` : null},
					darkModeLogo = ${entity.darkModeLogo ? `'${entity.darkModeLogo}'` : null},
				WHERE
					id = ${entity.id}`);
	}

	async bulkAdd(models: Team[]): Promise<void> {
		if (models.length === 0) {
			return;
    }

		const entities = models.map(model => this.mapDtoToDb(model));

		const valuesClause = entities.map(entity => `(
			'${entity.name}',
			${entity.isMale},
			${entity.seasonId},
			'${entity.city}',
			'${entity.state}',
			${entity.teamType},
			${entity.socialMedias ? `'${entity.socialMedias}'` : null},
			${entity.generalInfo ? `'${entity.generalInfo}'` : null},
			${entity.division},
			${entity.defaultLogo ? `'${entity.defaultLogo}'` : null},
			${entity.darkModeLogo ? `'${entity.darkModeLogo}'` : null})`).join(', ');

		await this.db.execute(`
			INSERT INTO teams (
				name,
				isMale,
				seasonId,
				city,
				state,
				type,
				socialMedias,
				generalInfo,
				division,
				defaultLogo,
				darkModeLogo
			) VALUES ${valuesClause};`);
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

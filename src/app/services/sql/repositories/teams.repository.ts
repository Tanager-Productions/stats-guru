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
    const teams = await this.db.select<TeamEntity[]>(`
			SELECT *
			FROM teams
			WHERE id = $1`, [id]);
    return this.mapDbToDto(teams[0]);
}

	async getAll(): Promise<Team[]> {
		const teams = await this.db.select<TeamEntity[]>(`
			SELECT *
			FROM teams`);
		return teams.map(this.mapDbToDto);
	}

	async add(model: Team): Promise<void> {
    const entity = this.mapDtoToDb(model);
    const sql = `
			INSERT INTO teams (
				name, isMale, seasonId, city, state, type, socialMedias, generalInfo, division, defaultLogo, darkModeLogo
			) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`;
    const values = [
			entity.name, entity.isMale, entity.seasonId, entity.city,
			entity.state, entity.teamType, entity.socialMedias,
			entity.generalInfo, entity.division, entity.defaultLogo,
			entity.darkModeLogo
    ];
    const result = await this.db.execute(sql, values);
    model.id = result.lastInsertId;
}

	async delete(id: number): Promise<void> {
		await this.db.execute(`
			DELETE FROM teams WHERE id = $1`, [id]);
	}

	async update(model: Team): Promise<void> {
    const entity = this.mapDtoToDb(model);
    const sql = `
			UPDATE
				teams
			SET
				name = $1, isMale = $2, seasonId = $3, city = $4, state = $5,
				type = $6, socialMedias = $7, generalInfo = $8, division = $9,
				defaultLogo = $10, darkModeLogo = $11
			WHERE
				id = $12`;
    const values = [
			entity.name, entity.isMale, entity.seasonId, entity.city, entity.state,
			entity.teamType, entity.socialMedias, entity.generalInfo, entity.division,
			entity.defaultLogo, entity.darkModeLogo, entity.id
    ];
    await this.db.execute(sql, values);
	}

	async bulkAdd(models: Team[]): Promise<void> {
    if (models.length === 0) {
			return;
    }

    const placeholders = models.map((_, index) => `(
			$${index * 11 + 1}, $${index * 11 + 2}, $${index * 11 + 3}, $${index * 11 + 4},
			$${index * 11 + 5}, $${index * 11 + 6}, $${index * 11 + 7}, $${index * 11 + 8},
			$${index * 11 + 9}, $${index * 11 + 10}, $${index * 11 + 11})`).join(', ');
    const values = models.flatMap(model => this.mapDtoToDb(model));
    const flatValues = values.flatMap(entity => [
			entity.name, entity.isMale, entity.seasonId, entity.city,
			entity.state, entity.teamType, entity.socialMedias,
			entity.generalInfo, entity.division, entity.defaultLogo,
			entity.darkModeLogo
    ]);

    const sql = `
			INSERT INTO teams (
				name, isMale, seasonId, city, state, type, socialMedias, generalInfo, division, defaultLogo, darkModeLogo
			) VALUES ${placeholders}`;
    await this.db.execute(sql, flatValues);
	}

	async hasTeamPlayer(id: number): Promise<boolean> {
    const results: {count: number}[] = await this.db.select(`
			SELECT count(id) AS count
			FROM players p
			WHERE p.firstName = 'team'
			AND p.lastName = 'team'
			AND p.teamId = $1`, [id]);
    return results[0].count == 0;
	}
}

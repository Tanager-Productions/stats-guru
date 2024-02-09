import { PlayerEntity } from "src/app/interfaces/entities";
import { Player, Game } from "src/app/interfaces/sgDtos";
import Database from "tauri-plugin-sql-api";
import { Repository } from "./repository.interface";

export class PlayersRepository implements Repository<PlayerEntity, Player, number> {
	private db: Database;

	constructor(db: Database) {
		this.db = db;
	}

	mapDbToDto = (entity: PlayerEntity): Player => {
		return {
			id: entity.id,
			firstName: entity.firstName,
			lastName: entity.lastName,
			number: entity.number,
			position: entity.position,
			teamId: entity.teamId,
			picture: entity.picture,
			isMale: entity.isMale == 1 ? true : false,
			height: entity.height,
			weight: entity.weight,
			age: entity.age,
			homeTown: entity.homeTown,
			homeState: entity.homeState,
			socialMedias: entity.socialMedias != null ? JSON.parse(entity.socialMedias) : null,
			generalInfo: entity.generalInfo != null ? JSON.parse(entity.generalInfo) : null,
			syncState: entity.syncState
		}
	}

	mapDtoToDb = (dto: Player): PlayerEntity => {
		return {
			id: dto.id,
			firstName: dto.firstName,
			lastName: dto.lastName,
			number: dto.number,
			position: dto.position,
			teamId: dto.teamId,
			picture: dto.picture,
			isMale: dto.isMale ? 1 : 0,
			height: dto.height,
			weight: dto.weight,
			age: dto.age,
			homeTown: dto.homeTown,
			homeState: dto.homeState,
			socialMedias: dto.socialMedias != null ? JSON.stringify(dto.socialMedias) : null,
			generalInfo: dto.generalInfo != null ? JSON.stringify(dto.generalInfo) : null,
			syncState: dto.syncState
		}
	}

	async find(id: number): Promise<Player> {
		const players = await this.db.select<PlayerEntity[]>(`
			SELECT 			*
			FROM 				players
			WHERE 			id = ${id}`);
		return this.mapDbToDto(players[0]);
	}

	async getAll(): Promise<Player[]> {
		const players = await this.db.select<PlayerEntity[]>(`
			SELECT 			*
			FROM 				players`);
		return players.map(this.mapDbToDto);
	}

	async add(model: Player): Promise<void> {
		const entity = this.mapDtoToDb(model);
		const result = await this.db.execute(`
			INSERT INTO players (
				firstName,
				lastName,
				number,
				position,
				teamId,
				picture,
				isMale,
				height,
				weight,
				age,
				homeTown,
				homeState,
				socialMedias,
				generalInfo
			) VALUES (
				'${entity.firstName}',
				'${entity.lastName}',
				${entity.number},
				${entity.position},
				${entity.teamId},
				${entity.picture ? `'${entity.picture}'` : null},
				${entity.isMale},
				${entity.height ? `'${entity.height}'` : null},
				${entity.weight},
				${entity.age},
				${entity.homeTown ? `'${entity.homeTown}'` : null},
				${entity.homeState ? `'${entity.homeState}'` : null},
				${entity.socialMedias ? `'${entity.socialMedias}'` : null},
				${entity.generalInfo ? `'${entity.generalInfo}'` : null}
			);`);
		model.id = result.lastInsertId;
	}

	async delete(id: number): Promise<void> {
		await this.db.execute(`
			DELETE FROM	players
			WHERE id = ${id}`);
	}

	async update(model: Player): Promise<void> {
		const entity = this.mapDtoToDb(model);

		await this.db.execute(`
			UPDATE players
			SET
				id = ${entity.id},
				firstName = '${entity.firstName}',
				lastName = '${entity.lastName}',
				number = ${entity.number},
				position = ${entity.position},
				teamId = ${entity.teamId},
				picture = ${entity.picture ? `'${entity.picture}'` : null},
				isMale = ${entity.isMale},
				height = ${entity.height ? `'${entity.height}'` : null},
				weight = ${entity.weight},
				age = ${entity.age},
				homeTown = ${entity.homeTown ? `'${entity.homeTown}'` : null},
				homeState = ${entity.homeState ? `'${entity.homeState}'` : null},
				socialMedias = ${entity.socialMedias ? `'${entity.socialMedias}'` : null},
				generalInfo = ${entity.generalInfo ? `'${entity.generalInfo}'` : null}
			WHERE
				id = ${entity.id}`);
	}

	async bulkAdd(models: Player[]): Promise<void> {
		if (models.length === 0) {
			return;
    }

		const entities = models.map(model => this.mapDtoToDb(model));

		const valuesClause = entities.map(entity => `(
			'${entity.firstName}',
			'${entity.lastName}',
			${entity.number},
			${entity.position},
			${entity.teamId},
			${entity.picture ? `'${entity.picture}'` : null},
			${entity.isMale},
			${entity.height ? `'${entity.height}'` : null},
			${entity.weight},
			${entity.age},
			${entity.homeTown ? `'${entity.homeTown}'` : null},
			${entity.homeState ? `'${entity.homeState}'` : null},
			${entity.socialMedias ? `'${entity.socialMedias}'` : null},
			${entity.generalInfo ? `'${entity.generalInfo}'` : null})`).join(', ');

		await this.db.execute(`
			INSERT INTO players (
				firstName,
				lastName,
				number,
				position,
				teamId,
				picture,
				isMale,
				height,
				weight,
				age,
				homeTown,
				homeState,
				socialMedias,
				generalInfo
			) VALUES ${valuesClause};`);
	}

	async getByGame(game: Game): Promise<Player[]> {
		var dbPlayers: PlayerEntity[] = await this.db.select<PlayerEntity[]>(`
			SELECT 		*
			FROM 			players
			WHERE 		teamId = ${game.homeTeam.teamId}
			OR				teamId = ${game.awayTeam.teamId}
		`);
		return dbPlayers.map(this.mapDbToDto);
	}
}

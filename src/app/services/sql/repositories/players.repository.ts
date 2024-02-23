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
			SELECT *
			FROM players
			WHERE id = $1`, [id]);
		return this.mapDbToDto(players[0]);
	}

	async getAll(): Promise<Player[]> {
		const players = await this.db.select<PlayerEntity[]>(`
			SELECT * FROM players`);
		return players.map(this.mapDbToDto);
	}

	async add(model: Player): Promise<void> {
		const entity = this.mapDtoToDb(model);
		const sql = `
			INSERT INTO players (
				firstName, lastName, number,
				position, teamId, picture,
				isMale, height, weight,
				age, homeTown, homeState,
				socialMedias, generalInfo
			) VALUES (
				$1, $2, $3, $4, $5,
				$6, $7, $8, $9, $10,
				$11, $12, $13, $14`;
		const values = [
			entity.firstName, entity.lastName, entity.number,
			entity.position, entity.teamId, entity.picture,
			entity.isMale, entity.height, entity.weight,
			entity.age, entity.homeTown, entity.homeState,
			entity.socialMedias, entity.generalInfo
		]
		const result = await this.db.execute(sql, values);
		model.id = result.lastInsertId;
	}

	async delete(id: number): Promise<void> {
		await this.db.execute(`
			DELETE FROM	players WHERE id = $1`, [id]);
	}

	async update(model: Player): Promise<void> {
		const entity = this.mapDtoToDb(model);

		const sql = `
			UPDATE
				players
			SET
				firstName = $1,
				lastName = $2,
				number = $3,
				position = $4,
				teamId = $5,
				picture = $6,
				isMale = $7,
				height = $8,
				weight = $9,
				age = $10,
				homeTown = $11,
				homeState = $12,
				socialMedias = $13,
				generalInfo = $14
			WHERE
				id = $15`;

		const values = [
			entity.firstName, entity.lastName, entity.number, entity.position,
			entity.teamId, entity.picture, entity.isMale, entity.height,
			entity.weight, entity.age, entity.homeTown, entity.homeState,
			entity.socialMedias, entity.generalInfo, entity.id
		];

		await this.db.execute(sql, values);
	}

	async bulkAdd(models: Player[]): Promise<void> {
		if (models.length === 0) {
			return;
		}

		const placeholders = models.map((_, index) => `(
			$${index * 14 + 1}, $${index * 14 + 2}, $${index * 14 + 3},
			$${index * 14 + 4}, $${index * 14 + 5}, $${index * 14 + 6},
			$${index * 14 + 7}, $${index * 14 + 8}, $${index * 14 + 9},
			$${index * 14 + 10}, $${index * 14 + 11}, $${index * 14 + 12},
			$${index * 14 + 13}, $${index * 14 + 14})`).join(', ');
		const dtos = models.flatMap(model => this.mapDtoToDb(model));
		const sql = `
			INSERT INTO players (
				firstName, lastName, number, position,
				teamId, picture, isMale, height,
				weight,  age, homeTown, homeState,
				socialMedias, generalInfo
			) VALUES ${placeholders};`;
		const values = dtos.map(entity => [
			entity.firstName, entity.lastName, entity.number, entity.position,
			entity.teamId, entity.picture, entity.isMale, entity.height,
			entity.weight, entity.age, entity.homeTown, entity.homeState,
			entity.socialMedias, entity.generalInfo
		]).flat();

		await this.db.execute(sql, values);
	}

	async getByGame(game: Game): Promise<Player[]> {
		var dbPlayers: PlayerEntity[] = await this.db.select<PlayerEntity[]>(`
			SELECT *
			FROM players
			WHERE teamId = $1
			OR teamId = $2`, [game.homeTeam.teamId, game.awayTeam.teamId]);
		return dbPlayers.map(this.mapDbToDto);
	}
}

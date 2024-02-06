import { Game, Player as PlayerEntity } from "src/app/interfaces/models";
import { Player } from "@tanager/tgs";
import { Repository } from "./repository.interface";
import Database from "tauri-plugin-sql-api";
import { SyncState } from "src/app/interfaces/syncState.enum";

type sgPlayer = {
	player: Player,
	syncState: SyncState
}

export class PlayersRepository implements Repository<sgPlayer, number> {
	private db: Database;
	constructor(db: Database) {
		this.db = db;
	}

	private mapDbToDto = (obj: PlayerEntity): sgPlayer => {
		return {
			player : {
									id: obj.id,
									firstName: obj.firstName,
									lastName: obj.lastName,
									number: obj.number,
									position: obj.position,
									teamId: obj.teamId,
									picture: obj.picture,
									isMale: obj.isMale == 1 ? true : false,
									height: obj.height,
									weight: obj.weight,
									age: obj.age,
									homeTown: obj.homeTown,
									homeState: obj.homeState,
									socialMedias: obj.socialMediaString != null ? JSON.parse(obj.socialMediaString) : null,
									generalInfo: obj.infoString != null ? JSON.parse(obj.infoString) : null
								},
			syncState: obj.syncState
		}
	}

	private mapDtoToDb = (obj: Player): PlayerEntity => {
		return {
			id: obj.id,
			firstName: obj.firstName,
			lastName: obj.lastName,
			number: obj.number,
			position: obj.position,
			teamId: obj.teamId,
			picture: obj.picture,
			isMale: obj.isMale ? 1 : 0,
			height: obj.height,
			weight: obj.weight,
			age: obj.age,
			homeTown: obj.homeTown,
			homeState: obj.homeState,
			socialMediaString: obj.socialMedias != null ? JSON.stringify(obj.socialMedias) : null,
			infoString: obj.generalInfo != null ? JSON.stringify(obj.generalInfo) : null,
			syncState: SyncState.Unchanged
		}
	}

	async find(id: number): Promise<sgPlayer> {
		const result = await this.db.select<PlayerEntity[]>(`select * from players where id = '${id}'`);
		const player = result[0];
		return this.mapDbToDto(player);
	}

	async getAll(): Promise<sgPlayer[]> {
		const players = await this.db.select<PlayerEntity[]>(`select * from players`);
		return players.map(this.mapDbToDto);
	}

	async add(model: Player): Promise<void> {
		const result = await this.db.execute(`
			INSERT into players (id,
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
				socialMediaString,
				infoString,
				syncState)
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
				$11,
				$12,
				$13,
				$14,
				$15,
				$16)
		`,
			[model.id,
			model.firstName,
			model.lastName,
			model.number,
			model.position,
			model.teamId,
			model.picture,
			model.isMale,
			model.height,
			model.weight,
			model.age,
			model.homeTown,
			model.homeState,
			model.socialMedias,
			model.generalInfo,
			SyncState.Added
			]
		);
		model.id = result.lastInsertId;
	}

	async delete(id: number): Promise<void> {
		await this.db.execute(`
			DELETE		*
			FROM	players
			WHERE id = '${id}'
		`);
	}

	async update(model: Player): Promise<void> {
		await this.db.execute(
			"UPDATE players SET firstName = $1, lastName = $2, number = $3, position = $4, teamId = $5, picture = $6, isMale = $7, height = $8, weight = $9, age = $10, homeTown = $11, homeState = $12, socialMediaString = $13, infoString = $14, syncState = $15 WHERE id = $16",
			[model.firstName, model.lastName, model.number, model.position, model.teamId, model.picture, model.isMale, model.height, model.weight, model.age, model.homeTown, model.homeState, model.socialMedias, model.generalInfo, SyncState.Modified, model.id]
		);
	}

	async bulkAdd(models: Player[]): Promise<void> {
		const dbPlayers: PlayerEntity[] = models.map(obj => ({
			id: obj.id,
			firstName: obj.firstName,
			lastName: obj.lastName,
			number: obj.number,
			position: obj.position,
			teamId: obj.teamId,
			picture: obj.picture,
			isMale: obj.isMale == true ? 1 : 0,
			height: obj.height,
			weight: obj.weight,
			age: obj.age,
			homeTown: obj.homeTown,
			homeState: obj.homeState,
			socialMediaString: JSON.stringify(obj.socialMedias),
			infoString: JSON.stringify(obj.generalInfo),
			syncState: SyncState.Added,
		}));
		for (const model of dbPlayers) {
			await this.db.execute(
				"INSERT into players (id, firstName, lastName, number, position, teamId, picture, isMale, height, weight, age, homeTown, homeState, socialMediaString, infoString, syncState) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)",
				[model.id,
				model.firstName,
				model.lastName,
				model.number,
				model.position,
				model.teamId,
				model.picture,
				model.isMale,
				model.height,
				model.weight,
				model.age,
				model.homeTown,
				model.homeState,
				model.socialMediaString,
				model.infoString,
				SyncState.Added
				]
			);
		}
	}

	async getByGame(game: Game): Promise<Player[]> {
		var dbPlayers: PlayerEntity[] = await this.db.select<PlayerEntity[]>(`
			SELECT 		*
			FROM 			players
			WHERE 		teamId = ${game.homeTeamId}
			OR				teamId = ${game.awayTeamId}
		`);

		return dbPlayers.map(obj => ({
			id: obj.id,
			firstName: obj.firstName,
			lastName: obj.lastName,
			number: obj.number,
			position: obj.position,
			teamId: obj.teamId,
			picture: obj.picture,
			isMale: obj.isMale == 1 ? true : false,
			height: obj.height,
			weight: obj.weight,
			age: obj.age,
			homeTown: obj.homeTown,
			homeState: obj.homeState,
			socialMedias: obj.socialMediaString != null ? JSON.parse(obj.socialMediaString) : null,
			generalInfo: obj.infoString != null ? JSON.parse(obj.infoString) : null,
		}));
	}
}

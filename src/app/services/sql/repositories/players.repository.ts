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
									socialMedias: obj.socialMedias != null ? JSON.parse(obj.socialMedias) : null,
									generalInfo: obj.generalInfo != null ? JSON.parse(obj.generalInfo) : null
								},
			syncState: SyncState.Unchanged
		}
	}

	private mapDtoToDb = (obj: sgPlayer): PlayerEntity => {
		return {
			id: obj.player.id,
			firstName: obj.player.firstName,
			lastName: obj.player.lastName,
			number: obj.player.number,
			position: obj.player.position,
			teamId: obj.player.teamId,
			picture: obj.player.picture,
			isMale: obj.player.isMale ? 1 : 0,
			height: obj.player.height,
			weight: obj.player.weight,
			age: obj.player.age,
			homeTown: obj.player.homeTown,
			homeState: obj.player.homeState,
			socialMedias: obj.player.socialMedias != null ? JSON.stringify(obj.player.socialMedias) : null,
			generalInfo: obj.player.generalInfo != null ? JSON.stringify(obj.player.generalInfo) : null
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

	async add(model: sgPlayer): Promise<void> {
		const result = await this.db.execute(`
			INSERT
			  into
			  players (id,
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
			[model.player.id,
			model.player.firstName,
			model.player.lastName,
			model.player.number,
			model.player.position,
			model.player.teamId,
			model.player.picture,
			model.player.isMale,
			model.player.height,
			model.player.weight,
			model.player.age,
			model.player.homeTown,
			model.player.homeState,
			model.player.socialMedias,
			model.player.generalInfo,
			SyncState.Added
			]
		);
		model.player.id = result.lastInsertId;
	}

	async delete(id: number): Promise<void> {
		await this.db.execute(`
			DELETE		*
			FROM	players
			WHERE id = '${id}'
		`);
	}

	async update(model: sgPlayer): Promise<void> {
		await this.db.execute(`
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
					socialMediaString = $13,
					infoString = $14,
					syncState = $15
				WHERE
					id = $16
		`,
			[model.player.firstName, model.player.lastName, model.player.number, model.player.position, model.player.teamId, model.player.picture, model.player.isMale, model.player.height, model.player.weight, model.player.age, model.player.homeTown, model.player.homeState, model.player.socialMedias, model.player.generalInfo, SyncState.Modified, model.player.id]
		);
	}

	async bulkAdd(models: sgPlayer[]): Promise<void> {
		const dbPlayers: PlayerEntity[] = models.map(this.mapDtoToDb);
		await this.db.execute(`
				INSERT
					into
					players (id,
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
			[dbPlayers]
		);
	}

	async getByGame(game: Game): Promise<sgPlayer[]> {
		var dbPlayers: PlayerEntity[] = await this.db.select<PlayerEntity[]>(`
			SELECT 		*
			FROM 			players
			WHERE 		teamId = ${game.homeTeamId}
			OR				teamId = ${game.awayTeamId}
		`);
		return dbPlayers.map(this.mapDbToDto);
	}
}

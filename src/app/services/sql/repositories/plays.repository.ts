import { Play as PlayEntity } from "src/app/interfaces/entities";
import { Repository } from "./repository.interface";
import Database from "tauri-plugin-sql-api";
import { Play } from "@tanager/tgs";
import { SyncState } from "src/app/interfaces/syncState.enum";

type sgPlay = {
	play: Play,
	syncState: SyncState
}

export class PlaysRepository implements Repository<sgPlay, number> {
	private db: Database;

	constructor(db: Database) {
		this.db = db;
	}

	private mapDbToDto = (obj: PlayEntity): sgPlay => {
		return {
			play : {
									order: obj.order,
									gameId: obj.gameId,
									turboStatsData: obj.turboStatsData,
									sgLegacyData: obj.sgLegacyData,
									player: null,
									team: null,
									action: obj.action,
									period: obj.period,
									gameClock: obj.gameClock,
									score: obj.score,
									timeStamp: obj.timeStamp
						  },
			syncState: SyncState.Unchanged
		}
	}

	private mapDtoToDb = (obj: sgPlay): PlayEntity => {
		return {
			id: 0,
			order: obj.play.order,
			gameId: obj.play.gameId,
			turboStatsData: obj.play.turboStatsData,
			sgLegacyData: obj.play.sgLegacyData,
			playerId: obj.play.player?.playerId!,
			teamId: obj.play.team?.teamId!,
			action: obj.play.action,
			period: obj.play.period,
			gameClock: obj.play.gameClock,
			score: obj.play.score,
			timeStamp: obj.play.timeStamp
		}
	}

	async find(id: number): Promise<sgPlay> {
		const result = (await this.db.select<PlayEntity[]>(`select * from plays where id = '${id}'`));
		const play = result[0];
		return this.mapDbToDto(play);
	}

	async getAll(): Promise<sgPlay[]> {
		const plays = (await this.db.select<PlayEntity[]>(`select * from plays`));
		return plays.map(this.mapDbToDto);
	}

	async add(model: sgPlay): Promise<void> {
		const result = await this.db.execute(`
			INSERT
				into
				plays (order,
				gameId,
				turboStatsData,
				sgLegacyData,
				teamId,
				playerId,
				action,
				period,
				gameClock,
				score,
				timeStamp,
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
			$12)
		`,
			[
				model.play.order,
				model.play.gameId,
				model.play.turboStatsData,
				model.play.sgLegacyData,
				model.play.team?.teamId,
				model.play.player?.playerId,
				model.play.action,
				model.play.period,
				model.play.gameClock,
				model.play.score,
				model.play.timeStamp,
				SyncState.Added
			]
	 );
	 //model.play. = result.lastInsertId;

	}

	async delete(id: number): Promise<void> {
		await this.db.execute(`
			DELETE		*
			FROM	plays
			WHERE id = '${id}'
		`);
	}

	async update(model: sgPlay): Promise<void> {
		await this.db.execute(`
				UPDATE
					plays
				SET
					turboStatsData = $1,
					sgLegacyData = $2,
					teamId = $3,
					playerId = $4,
					action = $5,
					period = $6,
					gameClock = $7,
					score = $8,
					timeStamp = $9,
					syncState = $10
				WHERE
					order = $11
					and gameId = $12
		`,
			[ model.play.turboStatsData, model.play.sgLegacyData, model.play.team?.teamId, model.play.player?.playerId, model.play.action, model.play.period, model.play.gameClock, model.play.score, model.play.timeStamp, SyncState.Modified, model.play.order, model.play.gameId ]
		);
	}

	async bulkAdd(models: sgPlay[]): Promise<void> {
		const dbPlays: PlayEntity[] = models.map(this.mapDtoToDb);
		await this.db.execute(`
				INSERT
					into
					plays (order,
					gameId,
					turboStatsData,
					sgLegacyData,
					teamId,
					playerId,
					action,
					period,
					gameClock,
					score,
					timeStamp,
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
				$12)
		`,
			[ dbPlays ]
		);
	}

	async getByGame(gameId: number): Promise<sgPlay[]> {
		var dbPlays: PlayEntity[] = await this.db.select<PlayEntity[]>(`
			SELECT 		*
			FROM 			plays
			WHERE 		gameId = ${gameId}
			AND				syncState != 3
			ORDER BY	order DESC
		`);
		return dbPlays.map(this.mapDbToDto);
	}
}

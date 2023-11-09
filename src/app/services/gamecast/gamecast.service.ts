import { Injectable } from '@angular/core';
import { Game, Play, Player, Stat } from 'src/app/interfaces/models';
import { SqlService } from '../sql/sql.service';
import { SyncState } from 'src/app/interfaces/syncState.enum';

@Injectable({
  providedIn: 'root'
})
export class GamecastService {
	/*private players!: Player[];
	private stats!: Stat[];
	private plays!: Play[];
	private game!: Game;
	private isMale!:boolean;
	private homeTeamName!:string;
	private awayTeamName!:string;

  constructor(private sql: SqlService) { }

	public send() {

	}

	public async fetchData(gameId:number) {
		this.game = (await this.sql.query({table: 'games', where: { id: gameId }}))[0];
		this.isMale = (await this.sql.rawQuery(`select isMale from teams where id = ${this.game!.homeTeamId}`))[0].isMale;
		this.homeTeamName = (await this.sql.rawQuery(`select name from teams where id = ${this.game!.homeTeamId}`))[0].name;
		this.awayTeamName = (await this.sql.rawQuery(`select name from teams where id = ${this.game!.awayTeamId}`))[0].name;
		this.homeTeamPlusOrMinus = this.game!.homeFinal;
		this.awayTeamPlusOrMinus = this.game!.awayFinal;
    this.homeTeamPlayers = await this.sql.query({
			table: 'players',
			where: { teamId: this.game!.homeTeamId },
			orderByColumn: 'number'
		});
    this.awayTeamPlayers = await this.sql.query({
			table: 'players',
			where: { teamId: this.game!.awayTeamId },
			orderByColumn: 'number'
		});
		this.stats = await this.sql.query({
			table: 'stats',
			where: { gameId: gameId }
		});
		this.plays = await this.sql.rawQuery(`
			SELECT 		*
			FROM 			plays
			WHERE 		gameId = ${gameId}
			AND				syncState != 3
			ORDER BY	playOrder DESC
		`);
		if (this.homeTeamPlayers.find(t => t.firstName == 'team' && t.lastName == 'team') == undefined) {
			this.addHomePlayer = true;
			await this.addPlayer({
				id:0,
				picture: null,
				firstName: 'team',
				lastName: 'team',
				isMale: this.isMale,
				teamId: this.game!.homeTeamId,
				socialMediaString: null,
				weight: null,
				age: null,
				number: -1,
				position: null,
				height: null,
				homeState: null,
				homeTown: null,
				syncState: SyncState.Unchanged,
				infoString: null
			});
		}
		if (this.awayTeamPlayers.find(t => t.firstName == 'team' && t.lastName == 'team') == undefined) {
			this.addHomePlayer = false;
			await this.addPlayer({
				id: 0,
				picture: null,
				firstName: 'team',
				lastName: 'team',
				isMale: this.isMale,
				teamId: this.game!.awayTeamId,
				socialMediaString: null,
				weight: null,
				age: null,
				number: -1,
				position: null,
				height: null,
				homeState: null,
				homeTown: null,
				syncState: SyncState.Unchanged,
				infoString: null
			});
		}
		if (this.game!.hiddenPlayers != null && this.game!.hiddenPlayers != "") {
			this.hiddenPlayerIds = this.game!.hiddenPlayers.split(',');
		}
		await this.fetchPlayersOnCourt();
	}*/
}

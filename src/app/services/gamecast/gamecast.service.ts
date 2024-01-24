import { Injectable, Signal, WritableSignal, computed, effect, inject, signal, untracked } from '@angular/core';
import { DEFAULT_PLAYER, DEFAULT_STAT, Game, Play, Player, Stat } from 'src/app/interfaces/models';
import { SqlService } from '../sql/sql.service';
import { SyncState } from 'src/app/interfaces/syncState.enum';

const playerSort = (a:Player, b:Player) => {
	if (a.number == b.number)
		return 0;
	else if (a.number < b.number)
		return -1;
	else
		return 1;
}

@Injectable({
  providedIn: 'root'
})
export class GamecastService {
	private sql = inject(SqlService);

	private statsSrc: WritableSignal<Stat[]> = signal([]);
	public stats = this.statsSrc.asReadonly();

	private playsSrc: WritableSignal<Play[]> = signal([]);
	public plays = this.playsSrc.asReadonly();

	private playersSrc: WritableSignal<Player[]> = signal([]);
	public players = this.playersSrc.asReadonly();
	public homeTeamPlayers = computed(() => {
		const players = this.players();
		const game = untracked(this.game);
		return players.filter(t => t.teamId == game?.homeTeamId).sort(playerSort);
	});
	public awayTeamPlayers = computed(() => {
		const players = this.players();
		const game = untracked(this.game);
		return players.filter(t => t.teamId == game?.awayTeamId).sort(playerSort);
	});

	private gameSrc: WritableSignal<Game|null> = signal(null);
	public game = this.gameSrc.asReadonly();
	private gameEffect = effect(async () => {
		const game = this.game();
		if (game) {
			game.syncState = game.syncState == SyncState.Added ? SyncState.Added : SyncState.Modified;
			await this.sql.save('games', game, { "id": game.id });
		}
	});

	private selectedPlayerId:WritableSignal<number|null> = signal(null);
	public selectedPlayer = computed(() => {
		const players = this.players();
		const playerId = this.selectedPlayerId();
		return players.find(t => t.id === playerId);
	});
	public selectedPlayerStat = computed(() => {
		const stats = this.stats();
		const playerId = this.selectedPlayerId();
		return stats.find(t => t.playerId == playerId);
	});

	public homePlayersOnCourt = computed(() => {
		const players = this.players();
		const stats = this.stats();
		const game = untracked(this.game);
		return players.filter(t => t.teamId == game?.homeTeamId && stats.find(s => s.playerId == t.id)?.onCourt === 1);
	});
	public awayPlayersOnCourt = computed(() => {
		const players = this.players();
		const stats = this.stats();
		const game = untracked(this.game);
		return players.filter(t => t.teamId == game?.awayTeamId && stats.find(s => s.playerId == t.id)?.onCourt === 1);
	});

	public hiddenPlayerIds = computed(() => {
		const game = this.game();
		return game?.hiddenPlayers?.split(',').map(t => Number(t));
	});

	private isMaleSrc: WritableSignal<1|0> = signal(1);
	public isMale = this.isMaleSrc.asReadonly();

	private homeTeamNameSrc = signal('');
	public homeTeamName = this.homeTeamNameSrc.asReadonly();

	private awayTeamNameSrc = signal('');
	public awayTeamName = this.awayTeamNameSrc.asReadonly();

	public async fetchData(gameId: number) {
		const results = await this.sql.query({
			table: 'games',
			where: { id: gameId }
		});
		const game: Game = results[0];
		this.gameSrc.set(game);

		const stats = await this.sql.query({
			table: 'stats',
			where: { gameId: gameId }
		});
		this.statsSrc.set(stats);

		const plays = await this.sql.rawQuery(`
			SELECT 		*
			FROM 			plays
			WHERE 		gameId = ${gameId}
			AND				syncState != 3
			ORDER BY	playOrder DESC
		`);
		this.playsSrc.set(plays);

		const players = await this.sql.rawQuery(`
			SELECT 		*
			FROM 			players
			WHERE 		teamId = ${game.homeTeamId}
			OR				teamId = ${game.awayTeamId}
		`);
		this.playersSrc.set(players);

		const isMaleResult: {isMale: 1|0}[] = await this.sql.rawQuery(`select isMale from teams where id = ${game.homeTeamId}`);
		this.isMaleSrc.set(isMaleResult[0].isMale);

		const homeTeamNameResult: {name: string}[] = await this.sql.rawQuery(`select name from teams where id = ${game.homeTeamId}`);
		this.homeTeamNameSrc.set(homeTeamNameResult[0].name);

		const awayTeamNameResult: {name: string}[] = await this.sql.rawQuery(`select name from teams where id = ${game.awayTeamId}`);
		this.awayTeamNameSrc.set(awayTeamNameResult[0].name);

		await this.setTeamPlayers(game);
	}

	private async setTeamPlayers(game: Game) {
		let homeCount = await this.sql.rawQuery(`
			select 	count(id) as count
			from 		players p
			where 	p.firstName = 'team'
			and 		p.lastName = 'team'
			and 		p.teamId == ${game.homeTeamId}
		`);
		if (homeCount[0].count == 0) {
			let teamPlayer = DEFAULT_PLAYER;
			teamPlayer.firstName = 'team';
			teamPlayer.lastName = 'team';
			teamPlayer.number = -1;
			teamPlayer.syncState = SyncState.Added;
			teamPlayer.isMale = this.isMale();
			teamPlayer.teamId = game.homeTeamId;
			await this.addPlayer(teamPlayer);
		}
		let awayCount = await this.sql.rawQuery(`
			select 	count(id) as count
			from 		players p
			where 	p.firstName = 'team'
			and 		p.lastName = 'team'
			and 		p.teamId == ${game.awayTeamId}
		`);
		if (awayCount[0].count == 0) {
			let teamPlayer = DEFAULT_PLAYER;
			teamPlayer.firstName = 'team';
			teamPlayer.lastName = 'team';
			teamPlayer.number = -1;
			teamPlayer.syncState = SyncState.Added;
			teamPlayer.isMale = this.isMale();
			teamPlayer.teamId = game.awayTeamId;
			await this.addPlayer(teamPlayer);
		}

		let homeTeamPlayer = this.players().find(t => t.firstName == 'team' && t.lastName == 'team' && t.number == -1 && t.teamId == this.game()!.homeTeamId)!;
		let awayTeamPlayer = this.players().find(t => t.firstName == 'team' && t.lastName == 'team' && t.number == -1 && t.teamId == this.game()!.awayTeamId)!;

		if (!this.homePlayersOnCourt().find(t => t.id == homeTeamPlayer.id)) {
			let stat = await this.getStat(homeTeamPlayer.id);
			stat.onCourt = 1;
			await this.updateStat(stat);
		}
		if (!this.awayPlayersOnCourt().find(t => t.id == awayTeamPlayer.id)) {
			let stat = await this.getStat(awayTeamPlayer.id);
			stat.onCourt = 1;
			await this.updateStat(stat);
		}
	}

	public setSelectedPlayer(playerId: number|null) {
		this.selectedPlayerId.set(playerId);
	}

	public async addPlayer(player:Player) {
		await this.sql.save('players', player);
		const game = this.game();
		if (game) {
			let players = await this.sql.rawQuery(`
				SELECT 		*
				FROM 			players
				WHERE 		teamId = ${game.homeTeamId}
				OR				teamId = ${game.awayTeamId}
			`);
			this.playersSrc.set(players);
		}
	}

	public async updatePlayer(player: Player) {
		player.syncState == SyncState.Added ? SyncState.Added : SyncState.Modified;
		await this.sql.save("players", player, {"id": player.id});
	}

	public async getStat(playerId:number) {
		const game = this.game();
		let stat = this.stats().find(t => t.playerId == playerId);
		if (!stat && game) {
			let newStat = DEFAULT_STAT;
			newStat.gameId = game.id;
			newStat.playerId = playerId;
			newStat.syncState = SyncState.Added;
			await this.sql.save("stats", newStat);
			let stats = await this.sql.query({
				table: 'stats',
				where: { gameId: game.id }
			});
			this.statsSrc.set(stats);
			return this.stats().find(t => t.playerId == playerId)!;
		} else {
			return stat!;
		}
	}

	public async updateStat(stat:Stat) {
		const game = this.game();
		if (game) {
			stat.syncState = stat.syncState == SyncState.Added ? SyncState.Added : SyncState.Modified;
			await this.sql.save("stats", stat, {"playerId": stat.playerId, "gameId": game.id});
			stat = (await this.sql.rawQuery(`select * from stats where playerId = '${stat.playerId}' and gameId = '${stat.gameId}'`))[0];
			this.statsSrc.update(stats => stats.map(value => value.id == stat.id ? stat : value));
		}
	}

	public switchPossession() {
		const game = this.game();
		if (game) {
			this.gameSrc.set({...game, homeHasPossession: game.homeHasPossession == 1 ? 0 : 1});
		}
	}

	public hidePlayer(player:Player) {
		const game = this.game();
		if (game) {
			const hiddenPlayers = this.hiddenPlayerIds() ?? [];
			this.gameSrc.set({ ...game, hiddenPlayers: [...hiddenPlayers, player.id].toString() });
		}
	}

	public unhidePlayer(player:Player) {
		const game = this.game();
		if (game) {
			const hiddenPlayers = this.hiddenPlayerIds()!;
			let index = hiddenPlayers.findIndex(t => t == player.id);
			hiddenPlayers.splice(index, 1);
			this.gameSrc.set({ ...game, hiddenPlayers: hiddenPlayers.toString() });
		}
	}

	public toggleGameComplete() {
		const game = this.game();
		if (game) {
			this.gameSrc.set({...game, complete: game.complete == 1 ? 0 : 1});
		}
	}


}

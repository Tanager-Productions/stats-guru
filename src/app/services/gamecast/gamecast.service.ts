import { Injectable, Signal, WritableSignal, computed, effect, inject, signal, untracked } from '@angular/core';
import { Game, Play, Player, Stat } from 'src/app/interfaces/models';
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

	public async fetchData(gameId: number) {
		const game = await this.sql.query({
			table: 'games',
			where: { id: gameId }
		});
		this.gameSrc.set(game[0]);

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


	}

	public setSelectedPlayer(playerId: number) {
		this.selectedPlayerId.set(playerId);
	}
}

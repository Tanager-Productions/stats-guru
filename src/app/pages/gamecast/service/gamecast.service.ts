import { Injectable, computed, effect, signal, untracked } from '@angular/core';
import { InputChangeEventDetail } from '@ionic/angular';
import { IonInputCustomEvent } from '@ionic/core';
import { database } from 'src/app/app.db';
import { sortBy } from 'lodash';
import { Stat, Player, SyncState, Play, Game, GameActions, Team } from 'src/app/app.types';
import { defaultPlayer, defaultStat } from 'src/app/app.utils';

const calculateStatColumns = (model: Stat) => {
	const {
		free_throws_made, field_goals_made, threes_made,
		offensive_rebounds, defensive_rebounds,
		assists, steals, blocks, field_goals_attempted,
		free_throws_attempted, turnovers
	} = model;
	model.points = free_throws_made + ((field_goals_made - threes_made) * 2) + (threes_made * 3);
	model.rebounds = offensive_rebounds + defensive_rebounds;
	model.eff = model.points + model.rebounds + assists + steals + blocks - (field_goals_attempted - field_goals_made) - (free_throws_attempted - free_throws_made) - turnovers;
}

const newTeamPlayer = (): (Player & { sync_state: SyncState }) => ({
	...defaultPlayer(),
	sync_state: SyncState.Added,
	first_name: 'team',
	last_name: 'team',
	number: '-1'
})

export type BoxScore = {
	number: string;
	name: string;
	player_id: number;
	assists: number;
	rebounds: number;
	defensive_rebounds: number;
	offensive_rebounds: number;
	field_goals_made: number;
	field_goals_attempted: number;
	blocks: number;
	steals: number;
	fouls: number;
	technical_fouls: number;
	plus_or_minus: number;
	points: number;
	turnovers: number;
	threes_made: number;
	threes_attempted: number;
	free_throws_made: number;
	free_throws_attempted: number;
};

export type ChangePeriodTotalsConfig = {
	totals: { p1: number, p2: number, p3: number, p4: number, ot: number },
	team: 'home' | 'away'
}

const mapStatToBoxScore = (stat: Stat, players: Player[]): BoxScore => {
	const player = players.find(t => t.sync_id == stat.player_id)!;
	return {
		number: (stat.player_number != null && stat.player_number != '') ? stat.player_number! : player.number,
		name: `${player.first_name} ${player.last_name}`,
		player_id: player.id,
		assists: stat.assists,
		rebounds: stat.rebounds,
		defensive_rebounds: stat.defensive_rebounds,
		offensive_rebounds: stat.offensive_rebounds,
		field_goals_made: stat.field_goals_made,
		field_goals_attempted: stat.field_goals_attempted,
		threes_made: stat.threes_made,
		threes_attempted: stat.threes_attempted,
		free_throws_made: stat.free_throws_made,
		free_throws_attempted: stat.free_throws_attempted,
		blocks: stat.blocks,
		steals: stat.steals,
		points: stat.points,
		turnovers: stat.turnovers,
		fouls: stat.fouls,
		technical_fouls: stat.technical_fouls ?? 0,
		plus_or_minus: stat.plus_or_minus
	}
}

const sumBoxScores = (boxScores: BoxScore[]): BoxScore => {
	let total: BoxScore = {
		number: '0',
		name: 'Totals',
		player_id: 0,
		assists: 0,
		rebounds: 0,
		defensive_rebounds: 0,
		offensive_rebounds: 0,
		field_goals_made: 0,
		field_goals_attempted: 0,
		blocks: 0,
		steals: 0,
		fouls: 0,
		technical_fouls: 0,
		plus_or_minus: 0,
		points: 0,
		turnovers: 0,
		threes_made: 0,
		threes_attempted: 0,
		free_throws_made: 0,
		free_throws_attempted: 0
	}
	return boxScores.reduce((result, curr) => {
		result.assists += curr.assists;
		result.rebounds += curr.rebounds;
		result.defensive_rebounds += curr.defensive_rebounds;
		result.offensive_rebounds += curr.offensive_rebounds;
		result.field_goals_made += curr.field_goals_made;
		result.field_goals_attempted += curr.field_goals_attempted;
		result.threes_made += curr.threes_made;
		result.threes_attempted += curr.threes_attempted;
		result.free_throws_made += curr.free_throws_made;
		result.free_throws_attempted += curr.free_throws_attempted;
		result.blocks += curr.blocks;
		result.steals += curr.steals;
		result.fouls += curr.fouls;
		result.technical_fouls += curr.technical_fouls;
		result.plus_or_minus += curr.plus_or_minus;
		result.points += curr.points;
		result.turnovers += curr.turnovers;
		return result;
	}, total);
}

@Injectable({
	providedIn: 'root'
})
export class GamecastService {
	private statsSrc = signal<(Stat & { sync_state: SyncState })[]>([]);
	public stats = this.statsSrc.asReadonly();

	private playsSrc = signal<(Play & { sync_state: SyncState })[]>([]);
	public plays = this.playsSrc.asReadonly();

	private playersSrc = signal<(Player & { sync_state: SyncState })[]>([]);
	public players = this.playersSrc.asReadonly();

	private gameSrc = signal<(Game & { sync_state: SyncState }) | null>(null);
	public game = this.gameSrc.asReadonly();
	private gameEffect = effect(async () => {
		const game = this.game();
		if (game) {
			game.sync_state = game.sync_state == SyncState.Added ? SyncState.Added : SyncState.Modified;
			if (game.settings == null) {
				game.settings = {
					reset_timeouts: 4,
					full_timeouts: 2,
					partial_timeouts: 1,
					minutes_per_period: 9,
					minutes_per_overtime: 4,
					reset_fouls: 1
				};
			}

			await database.games.put(game);
		}
	});

	public selectedPlayerId = signal<string | null>(null);

	public selectedPlayer = computed(() => {
		const players = this.players();
		const player_id = this.selectedPlayerId();
		return players.find(t => t.sync_id === player_id);
	});

	public selectedPlayerStat = computed(() => {
		const stats = this.stats();
		const player_id = this.selectedPlayerId();
		return stats.find(t => t.player_id == player_id);
	});

	public homePlayersOnCourt = computed(() => {
		const players = this.players();
		const stats = this.stats();
		const game = untracked(this.game);
		return sortBy(players.filter(t => t.team_id == game?.home_team_id && stats.find(s => s.player_id == t.sync_id)?.on_court), t => {
			const numberOverride = stats.find(x => x.player_id == t.sync_id)?.player_number;
			return Number(numberOverride ?? t.number) || 0;
		});
	});

	public awayPlayersOnCourt = computed(() => {
		const players = this.players();
		const stats = this.stats();
		const game = untracked(this.game);
		return sortBy(players.filter(t => t.team_id == game?.away_team_id && stats.find(s => s.player_id == t.sync_id)?.on_court), t => {
			const numberOverride = stats.find(x => x.player_id == t.sync_id)?.player_number;
			return Number(numberOverride ?? t.number) || 0;
		});
	});

	public homeTeamPlayers = computed(() => {
		const players = this.players();
		const stats = this.stats();
		const game = untracked(this.game);
		return sortBy(players.filter(t => t.team_id == game?.home_team_id), t => {
			const numberOverride = stats.find(x => x.player_id == t.sync_id)?.player_number;
			return Number(numberOverride ?? t.number) || 0;
		});
	});

	public awayTeamPlayers = computed(() => {
		const players = this.players();
		const stats = this.stats();
		const game = untracked(this.game);
		return sortBy(players.filter(t => t.team_id == game?.away_team_id), t => {
			const numberOverride = stats.find(x => x.player_id == t.sync_id)?.player_number;
			return Number(numberOverride ?? t.number) || 0;
		});
	});

	public hiddenPlayerIds = computed(() => {
		const stats = this.stats();
		return stats.filter(t => t.player_hidden).map(t => t.player_id);
	});

	public boxScore = computed(() => {
		const homeTeamPlayers = this.homeTeamPlayers();
		const awayTeamPlayers = this.awayTeamPlayers();
		const stats = this.stats();
		return {
			homeBoxScore: stats
				.filter(t => homeTeamPlayers.find(p => p.sync_id == t.player_id))
				.map(t => mapStatToBoxScore(t, homeTeamPlayers))
				.sort((m, n) => Number(m.number) - Number(n.number)),
			awayBoxScore: stats
				.filter(t => awayTeamPlayers.find(p => p.sync_id == t.player_id))
				.map(t => mapStatToBoxScore(t, awayTeamPlayers))
				.sort((m, n) => Number(m.number) - Number(n.number))
		}
	});

	public boxScoreTotals = computed(() => {
		const boxScore = this.boxScore();
		return {
			homeTotals: sumBoxScores(boxScore.homeBoxScore),
			awayTotals: sumBoxScores(boxScore.awayBoxScore)
		}
	});

	private homeTeamSrc = signal<Team | null>(null);
	public homeTeam = this.homeTeamSrc.asReadonly();
	private awayTeamSrc = signal<Team | null>(null);
	public awayTeam = this.awayTeamSrc.asReadonly();

	/**
	 * Forces a final game save before they leave the page
	 */
	public destroy() {
		this.gameSrc.update(game => ({ ...game! }));
	}

	public async setGame(gameId: number) {
		const game = (await database.games.get(gameId))!;
		this.gameSrc.set(game);

		this.homeTeamSrc.set(await database.teams.get(game.home_team_id) ?? null);
		this.awayTeamSrc.set(await database.teams.get(game.away_team_id) ?? null);

		const players = await database.players
			.where('team_id').equals(game.home_team_id)
			.or('team_id').equals(game.away_team_id)
			.toArray();
		this.playersSrc.set(players);

		await this.setTeamPlayers(game);

		let stats = await database.stats.where({ game_id: game.sync_id }).toArray();
		for (let player of players) {
			if (!stats.find(t => t.player_id == player.sync_id)) {
				stats.push({
					...defaultStat,
					player_id: player.sync_id,
					game_id: game.sync_id,
					sync_state: SyncState.Added
				});
			}
		}
		this.statsSrc.set(stats);

		const plays = (await database.plays
			.where({ game_id: game.sync_id })
			.and(t => t.sync_state != SyncState.Deleted)
			.sortBy('id'))
			.reverse();
		this.playsSrc.set(plays);
	}

	private async setTeamPlayers(game: Game) {
		let homeTeamPlayer = await database.players.where({
			team_id: game.home_team_id,
			first_name: 'team',
			last_name: 'team'
		}).first();
		let awayTeamPlayer = await database.players.where({
			team_id: game.away_team_id,
			first_name: 'team',
			last_name: 'team'
		}).first();

		if (!homeTeamPlayer) {
			homeTeamPlayer = {
				...newTeamPlayer(),
				is_male: this.homeTeam()!.is_male,
				team_id: game.home_team_id
			}
			await this.addPlayer(homeTeamPlayer);
		}

		if (!awayTeamPlayer) {
			awayTeamPlayer = {
				...newTeamPlayer(),
				is_male: this.awayTeam()!.is_male,
				team_id: game.away_team_id
			}
			await this.addPlayer(awayTeamPlayer);
		}

		if (!this.homePlayersOnCourt().find(t => t.id == homeTeamPlayer!.id)) {
			this.updateStat({
				player: homeTeamPlayer,
				updateFn: stat => stat.on_court = true
			});
		}

		if (!this.awayPlayersOnCourt().find(t => t.id == awayTeamPlayer!.id)) {
			this.updateStat({
				player: awayTeamPlayer,
				updateFn: stat => stat.on_court = true
			});
		}
	}

	public async addPlayer(player: Player & { sync_state: SyncState }) {
		const { id: _, ...rest } = player;
		const id = await database.transaction('rw', 'players', () => database.players.add(rest));
		player.id = id;
		this.playersSrc.update(players => [...players, player]);
		this.statsSrc.update(stats => [...stats, {
			...defaultStat,
			player_id: player.sync_id,
			game_id: this.game()!.sync_id,
			sync_state: SyncState.Added
		}]);
	}

	public async updatePlayer(playerToUpdate: Player & { sync_state: SyncState }) {
		playerToUpdate.sync_state == SyncState.Added ? SyncState.Added : SyncState.Modified;
		this.playersSrc.update(players => players.map(player => {
			if (player.id == playerToUpdate.id) {
				database.transaction('rw', 'players', () => {
					database.players.put(playerToUpdate);
				});
				return { ...playerToUpdate };
			} else {
				return player;
			}
		}))
	}

	public updateStat(options: { player?: Player, updateFn: (stat: Stat) => void }) {
		const player_id = options.player ? options.player.sync_id : this.selectedPlayerId();
		if (player_id == null) {
			throw 'What exactly are you trying to do?';
		} else {
			const prevStat = this.statsSrc().find(t => t.player_id == player_id);
			if (prevStat) {
				this.statsSrc.update(stats => stats.map(stat => {
					if (stat.player_id == player_id) {
						options.updateFn(stat);
						calculateStatColumns(stat);
						stat.sync_state = stat.sync_state == SyncState.Added ? SyncState.Added : SyncState.Modified;
						database.transaction('rw', 'stats', () => database.stats.put(stat));
					}
					return stat;
				}));
			} else {
				const game = this.game()!;
				const newStat = {
					...defaultStat,
					sync_state: SyncState.Added,
					game_id: game.sync_id,
					player_id: player_id
				};
				options.updateFn(newStat);
				calculateStatColumns(newStat);
				database.transaction('rw', 'stats', () => database.stats.add(newStat));
				this.statsSrc.update(stats => [...stats, newStat]);
			}
		}
	}

	public switchPossession() {
		const game = this.game();
		if (game) {
			this.gameSrc.set({ ...game, home_has_possession: !game.home_has_possession });
		}
	}

	public togglePlayerHidden(player: Player) {
		this.statsSrc.update(stats => stats.map(stat => {
			if (stat.player_id == player.sync_id) {
				database.transaction('rw', 'stats', () => {
					database.stats.update({ player_id: stat.player_id, game_id: stat.game_id }, { 'player_hidden': !stat.player_hidden });
				});
				return { ...stat, player_hidden: !stat.player_hidden }
			} else {
				return stat
			}
		}));
	}

	public toggleGameComplete() {
		const game = this.game();
		if (game) {
			this.gameSrc.set({ ...game, complete: !game.complete });
		}
	}

	public updatePeriodTotal(team: 'home' | 'away', points: number) {
		const game = { ...this.game()! };
		if (team == 'away') {
			if (game.period == 1) {
				game.away_points_q1 += points;
			} else if (game.period == 2) {
				game.away_points_q2 += points;
			} else if (game.period == 3) {
				game.away_points_q3 += points;
			} else if (game.period == 4) {
				game.away_points_q4 += points;
			} else {
				game.away_points_ot += points;
			}
			game.away_final += points;
		} else {
			if (game.period == 1) {
				game.home_points_q1 += points;
			} else if (game.period == 2) {
				game.home_points_q2 += points;
			} else if (game.period == 3) {
				game.home_points_q3 += points;
			} else if (game.period == 4) {
				game.home_points_q4 += points;
			} else {
				game.home_points_ot += points;
			}
			game.home_final += points;
		}
		this.gameSrc.set(game);
	}

	public changePeriodTotals(config: ChangePeriodTotalsConfig) {
		const game = { ...this.game()! };
		const { p1, p2, p3, p4, ot } = config.totals;
		if (config.team == 'away') {
			game.away_points_q1 = p1;
			game.away_points_q2 = p2;
			game.away_points_q3 = p3;
			game.away_points_q4 = p4;
			game.away_points_ot = ot;
			game.away_final = p1 + p2 + p2 + p4 + ot;
		} else {
			game.home_points_q1 = p1;
			game.home_points_q2 = p2;
			game.home_points_q3 = p3;
			game.home_points_q4 = p4;
			game.home_points_ot = ot;
			game.home_final = p1 + p2 + p2 + p4 + ot;
		}
		this.gameSrc.set(game);
	}

	public resetTOs() {
		const game = { ...this.game()! };
		if (game.settings?.reset_timeouts == 1 || game.settings?.reset_timeouts == 2) {
			game.home_full_tol = game.settings?.full_timeouts ?? 0;
			game.away_full_tol = game.settings?.full_timeouts ?? 0;
			game.home_partial_tol = game.settings?.partial_timeouts ?? 0;
			game.away_partial_tol = game.settings?.partial_timeouts ?? 0;
			this.gameSrc.set(game);
		}
		if (game.settings?.reset_timeouts == 3 || game.settings?.reset_timeouts == 4) {
			game.home_full_tol = game.settings?.full_timeouts ?? 0;
			game.away_full_tol = game.settings?.full_timeouts ?? 0;
			this.gameSrc.set(game);
		}
	}

	public resetFouls() {
		const game = { ...this.game()! };
		game.home_current_fouls = 0;
		game.away_current_fouls = 0;
		this.gameSrc.set(game);
	}

	public addPlay(team: 'home' | 'away', action: GameActions, player?: Player) {
		const plays = this.plays();
		const game = this.game()!;
		const selectedPlayer = player ?? this.selectedPlayer();
		let play: Play & { sync_state: SyncState } = {
			id: plays.length + 1,
			game_id: game.sync_id,
			turbo_stats_data: null,
			sg_legacy_data: null,
			sync_state: SyncState.Added,
			period: game.period,
			player_id: selectedPlayer && (action != GameActions.FullTO && action != GameActions.PartialTO) ? selectedPlayer.sync_id : null,
			team_id: team == 'home' ? game.home_team_id : game.away_team_id,
			score: `${game.home_final} - ${game.away_final}`,
			time_stamp: new Date().toJSON(),
			action: action,
			game_clock: game.clock
		}
		database.transaction('rw', 'plays', async () => {
			const existing = await database.plays.get({ game_id: game.id, id: play.id });
			if (existing && existing.sync_state != SyncState.Added) {
				play.sync_state = SyncState.Modified;
			}
			this.playsSrc.update(plays => [play, ...plays]);
			database.plays.put(play);
		});
	}

	public addFoulToGame(team: 'home' | 'away') {
		const game = { ...this.game()! };
		if (team == 'away') {
			if (game.away_current_fouls == null) {
				game.away_current_fouls = 1;
			} else {
				game.away_current_fouls++;
			}
		} else {
			if (game.home_current_fouls == null) {
				game.home_current_fouls = 1;
			} else {
				game.home_current_fouls++;
			}
		}
		this.gameSrc.set(game);
	}

	public addTimeoutToGame(team: 'home' | 'away', partial: boolean) {
		const game = { ...this.game()! };
		if (team == 'away') {
			if (game.away_team_tol > 0) {
				game.away_team_tol--;
			}
			if (partial && game.away_partial_tol != null && game.away_partial_tol > 0) {
				game.away_partial_tol--;
			} else if (!partial && game.away_full_tol != null && game.away_full_tol > 0) {
				game.away_full_tol--;
			}
		} else {
			if (game.home_team_tol > 0) {
				game.home_team_tol--;
			}
			if (partial && game.home_partial_tol != null && game.home_partial_tol > 0) {
				game.home_partial_tol--;
			} else if (!partial && game.home_full_tol != null && game.home_full_tol > 0) {
				game.home_full_tol--;
			}
		}
		this.gameSrc.set(game);
	}

	public async updatePlusOrMinus(homePOMToAdd: number, awayPOMToAdd: number) {
		const game = this.game()!;
		const homeStats = await database.stats
			.where('player_id')
			.anyOf(this.homePlayersOnCourt().map(t => t.sync_id))
			.and(t => t.game_id == game.sync_id)
			.toArray()
		for (let stat of homeStats) {
			this.updateStat({
				player: this.players().find(t => t.sync_id == stat.player_id)!,
				updateFn: stat => stat.plus_or_minus += homePOMToAdd
			});
		}
		const awayStats = await database.stats
			.where('player_id')
			.anyOf(this.awayPlayersOnCourt().map(t => t.sync_id))
			.and(t => t.game_id == game.sync_id)
			.toArray()
		for (let stat of awayStats) {
			this.updateStat({
				player: this.players().find(t => t.sync_id == stat.player_id)!,
				updateFn: stat => stat.plus_or_minus += awayPOMToAdd
			});
		}
	}

	public removeLastPlay() {
		let play = this.plays()[0];
		this.undoAction(play);
		this.playsSrc.update(plays => plays.slice(1));
		database.transaction('rw', 'plays', async () => {
			if (play.sync_state == SyncState.Added) {
				database.plays.where({ game_id: play.game_id, id: play.id }).delete();
			} else {
				database.plays.update(play, { sync_state: SyncState.Deleted });
			}
		});
	}

	public updatePlay(play: Play & { sync_state: SyncState }) {
		this.playsSrc.update(plays => {
			const playToUpdateIndex = plays.findIndex(t => t.id == play.id && t.game_id == play.game_id);
			const playToUpdate = { ...plays[playToUpdateIndex] };
			this.undoAction(playToUpdate)
			this.redoAction(play);
			play.score = `${this.game()?.home_final} - ${this.game()?.away_final}`;
			play.sync_state = play.sync_state == SyncState.Added ? SyncState.Added : SyncState.Modified;
			database.transaction('rw', 'plays', () => database.plays.put(play));
			return [
				...plays.slice(0, playToUpdateIndex),
				play,
				...plays.slice(playToUpdateIndex + 1)
			];
		});
	}

	private undoAction(play: Play) {
		const game = { ...this.game()! };
		const player = this.players().find(t => t.sync_id == play.player_id);
		if (play.action == GameActions.Assist) {
			this.updateStat({
				player: player,
				updateFn: stat => stat.assists--
			});
		} else if (play.action == GameActions.Block) {
			this.updateStat({
				player: player,
				updateFn: stat => stat.blocks--
			});
		} else if (play.action == GameActions.DefRebound) {
			this.updateStat({
				player: player,
				updateFn: stat => stat.defensive_rebounds--
			});
		} else if (play.action == GameActions.Foul) {
			this.updateStat({
				player: player,
				updateFn: stat => stat.fouls--
			});
			if (player?.team_id === game.home_team_id) {
				game.home_current_fouls!--;
			} else {
				game.away_current_fouls!--;
			}
		} else if (play.action == GameActions.FreeThrowMade) {
			this.updateStat({
				player: player,
				updateFn: stat => {
					stat.free_throws_made--
					stat.free_throws_attempted--
				}
			});
			if (player?.team_id == game.home_team_id) {
				if (play.period == 1) {
					game.home_points_q1--;
				} else if (play.period == 2) {
					game.home_points_q2--;
				} else if (play.period == 3 && !game.has_four_quarters) {
					game.home_points_ot--;
				} else if (play.period == 3 && game.has_four_quarters) {
					game.home_points_q3--;
				} else if (play.period == 4) {
					game.home_points_q4--;
				} else if (play.period == 5) {
					game.home_points_ot--;
				}
				game.home_final--;
			} else {
				if (play.period == 1) {
					game.away_points_q1--;
				} else if (play.period == 2) {
					game.away_points_q2--;
				} else if (play.period == 3 && !game.has_four_quarters) {
					game.away_points_ot--;
				} else if (play.period == 3 && game.has_four_quarters) {
					game.away_points_q3--;
				} else if (play.period == 4) {
					game.away_points_q4--;
				} else if (play.period == 5) {
					game.away_points_ot--;
				}
				game.away_final--;
			}
		} else if (play.action == GameActions.FreeThrowMissed) {
			this.updateStat({
				player: player,
				updateFn: stat => stat.free_throws_attempted--
			});
		} else if (play.action == GameActions.FullTO) {
			if (play.team_id == game.home_team_id) {
				game.home_team_tol++;
				game.home_full_tol!++;
			} else {
				game.away_team_tol++;
				game.away_full_tol!++;
			}
		} else if (play.action == GameActions.OffRebound) {
			this.updateStat({
				player: player,
				updateFn: stat => stat.offensive_rebounds--
			});
		} else if (play.action == GameActions.PartialTO) {
			if (play.team_id == game.home_team_id) {
				game.home_team_tol++;
				game.home_partial_tol!++;
			} else {
				game.away_team_tol++;
				game.away_partial_tol!++;
			}
		} else if (play.action == GameActions.ShotMade) {
			this.updateStat({
				player: player,
				updateFn: stat => {
					stat.field_goals_attempted--
					stat.field_goals_made--
				}
			});
			if (player?.team_id == game.home_team_id) {
				if (play.period == 1) {
					game.home_points_q1 -= 2;
				} else if (play.period == 2) {
					game.home_points_q2 -= 2;
				} else if (play.period == 3 && !game.has_four_quarters) {
					game.home_points_ot -= 2;
				} else if (play.period == 3 && game.has_four_quarters) {
					game.home_points_q3 -= 2;
				} else if (play.period == 4) {
					game.home_points_q4 -= 2;
				} else if (play.period == 5) {
					game.home_points_ot -= 2;
				}
				game.home_final -= 2;
			} else {
				if (play.period == 1) {
					game.away_points_q1 -= 2;
				} else if (play.period == 2) {
					game.away_points_q2 -= 2;
				} else if (play.period == 3 && !game.has_four_quarters) {
					game.away_points_ot -= 2;
				} else if (play.period == 3 && game.has_four_quarters) {
					game.away_points_q3 -= 2;
				} else if (play.period == 4) {
					game.away_points_q4 -= 2;
				} else if (play.period == 5) {
					game.away_points_ot -= 2;
				}
				game.away_final -= 2;
			}
		} else if (play.action == GameActions.ShotMissed) {
			this.updateStat({
				player: player,
				updateFn: stat => stat.field_goals_attempted--
			});
		} else if (play.action == GameActions.Steal) {
			this.updateStat({
				player: player,
				updateFn: stat => stat.steals--
			});
		} else if (play.action == GameActions.ThreeMade) {
			this.updateStat({
				player: player,
				updateFn: stat => {
					stat.threes_attempted--
					stat.threes_made--
					stat.field_goals_attempted--
					stat.field_goals_made--
				}
			});
			if (player?.team_id == game.home_team_id) {
				if (play.period == 1) {
					game.home_points_q1 -= 3;
				} else if (play.period == 2) {
					game.home_points_q2 -= 3;
				} else if (play.period == 3 && !game.has_four_quarters) {
					game.home_points_ot -= 3;
				} else if (play.period == 3 && game.has_four_quarters) {
					game.home_points_q3 -= 3;
				} else if (play.period == 4) {
					game.home_points_q4 -= 3;
				} else if (play.period == 5) {
					game.home_points_ot -= 3;
				}
				game.home_final -= 3;
			} else {
				if (play.period == 1) {
					game.away_points_q1 -= 3;
				} else if (play.period == 2) {
					game.away_points_q2 -= 3;
				} else if (play.period == 3 && !game.has_four_quarters) {
					game.away_points_ot -= 3;
				} else if (play.period == 3 && game.has_four_quarters) {
					game.away_points_q3 -= 3;
				} else if (play.period == 4) {
					game.away_points_q4 -= 3;
				} else if (play.period == 5) {
					game.away_points_ot -= 3;
				}
				game.away_final -= 3;
			}
		} else if (play.action == GameActions.ThreeMissed) {
			this.updateStat({
				player: player,
				updateFn: stat => {
					stat.threes_attempted--
					stat.field_goals_attempted--
				}
			});
		} else if (play.action == GameActions.Turnover) {
			this.updateStat({
				player: player,
				updateFn: stat => stat.turnovers--
			});
		}
		this.gameSrc.set(game);
	}

	private redoAction(play: Play) {
		const game = { ...this.game()! };
		const player = this.players().find(t => t.sync_id == play.player_id);
		let updateFn: (stat: Stat) => void = () => { };
		if (play.action == GameActions.Assist) {
			updateFn = stat => stat.assists++
		} else if (play.action == GameActions.Block) {
			updateFn = stat => stat.blocks++
		} else if (play.action == GameActions.DefRebound) {
			updateFn = stat => stat.defensive_rebounds++
		} else if (play.action == GameActions.Foul) {
			updateFn = stat => stat.fouls++
			if (player?.team_id == game.home_team_id) {
				game.home_current_fouls!++;
			} else {
				game.away_current_fouls!++;
			}
		} else if (play.action == GameActions.FreeThrowMade) {
			updateFn = stat => {
				stat.free_throws_attempted++
				stat.free_throws_made++
			}
			if (player?.team_id == game.home_team_id) {
				if (play.period == 1) {
					game.home_points_q1++;
				} else if (play.period == 2) {
					game.home_points_q2++;
				} else if (play.period == 3 && !game.has_four_quarters) {
					game.home_points_ot++;
				} else if (play.period == 3 && game.has_four_quarters) {
					game.home_points_q3++;
				} else if (play.period == 4) {
					game.home_points_q4++;
				} else if (play.period == 5) {
					game.home_points_ot++;
				}
				game.home_final++;
			} else {
				if (play.period == 1) {
					game.away_points_q1++;
				} else if (play.period == 2) {
					game.away_points_q2++;
				} else if (play.period == 3 && !game.has_four_quarters) {
					game.away_points_ot++;
				} else if (play.period == 3 && game.has_four_quarters) {
					game.away_points_q3++;
				} else if (play.period == 4) {
					game.away_points_q4++;
				} else if (play.period == 5) {
					game.away_points_ot++;
				}
				game.away_final++;
			}
		} else if (play.action == GameActions.FreeThrowMissed) {
			updateFn = stat => stat.free_throws_attempted++
		} else if (play.action == GameActions.FullTO) {
			if (play.team_id == game.home_team_id) {
				game.home_team_tol--;
				game.home_full_tol!--;
			} else {
				game.away_team_tol--;
				game.away_full_tol!--;
			}
		} else if (play.action == GameActions.OffRebound) {
			updateFn = stat => stat.offensive_rebounds++
		} else if (play.action == GameActions.PartialTO) {
			if (play.team_id == game.home_team_id) {
				game.home_team_tol--;
				game.home_partial_tol!--;
			} else {
				game.away_team_tol--;
				game.away_partial_tol!--;
			}
		} else if (play.action == GameActions.ShotMade) {
			updateFn = stat => {
				stat.field_goals_attempted++
				stat.field_goals_made++
			}
			if (player?.team_id == game.home_team_id) {
				if (play.period == 1) {
					game.home_points_q1 += 2;
				} else if (play.period == 2) {
					game.home_points_q2 += 2;
				} else if (play.period == 3 && !game.has_four_quarters) {
					game.home_points_ot += 2;
				} else if (play.period == 3 && game.has_four_quarters) {
					game.home_points_q3 += 2;
				} else if (play.period == 4) {
					game.home_points_q4 += 2;
				} else if (play.period == 5) {
					game.home_points_ot += 2;
				}
				game.home_final += 2;
			} else {
				if (play.period == 1) {
					game.away_points_q1 += 2;
				} else if (play.period == 2) {
					game.away_points_q2 += 2;
				} else if (play.period == 3 && !game.has_four_quarters) {
					game.away_points_ot += 2;
				} else if (play.period == 3 && game.has_four_quarters) {
					game.away_points_q3 += 2;
				} else if (play.period == 4) {
					game.away_points_q4 += 2;
				} else if (play.period == 5) {
					game.away_points_ot += 2;
				}
				game.away_final += 2;
			}
		} else if (play.action == GameActions.ShotMissed) {
			updateFn = stat => stat.field_goals_attempted++
		} else if (play.action == GameActions.Steal) {
			updateFn = stat => stat.steals++
		} else if (play.action == GameActions.ThreeMade) {
			updateFn = stat => {
				stat.field_goals_attempted++
				stat.field_goals_made++
				stat.threes_attempted++
				stat.threes_made++
			}
			if (player?.team_id == game.home_team_id) {
				if (play.period == 1) {
					game.home_points_q1 += 3;
				} else if (play.period == 2) {
					game.home_points_q2 += 3;
				} else if (play.period == 3 && !game.has_four_quarters) {
					game.home_points_ot += 3;
				} else if (play.period == 3 && game.has_four_quarters) {
					game.home_points_q3 += 3;
				} else if (play.period == 4) {
					game.home_points_q4 += 3;
				} else if (play.period == 5) {
					game.home_points_ot += 3;
				}
				game.home_final += 3;
			} else {
				if (play.period == 1) {
					game.away_points_q1 += 3;
				} else if (play.period == 2) {
					game.away_points_q2 += 3;
				} else if (play.period == 3 && !game.has_four_quarters) {
					game.away_points_ot += 3;
				} else if (play.period == 3 && game.has_four_quarters) {
					game.away_points_q3 += 3;
				} else if (play.period == 4) {
					game.away_points_q4 += 3;
				} else if (play.period == 5) {
					game.away_points_ot += 3;
				}
				game.away_final += 3;
			}
		} else if (play.action == GameActions.ThreeMissed) {
			updateFn = stat => {
				stat.threes_attempted++
				stat.field_goals_attempted++
			}
		} else if (play.action == GameActions.Turnover) {
			updateFn = stat => stat.turnovers++
		}
		this.gameSrc.set(game);
		this.updateStat({
			player: player,
			updateFn: updateFn
		});
	}

	public updateCurrentFouls(team: 'home' | 'away', event: IonInputCustomEvent<InputChangeEventDetail>) {
		this.gameSrc.update(game => {
			const { value } = event.detail;
			var newGame = { ...game! };
			if (team == 'home') {
				newGame.home_current_fouls = value ? Number(value) : null;
			} else {
				newGame.away_current_fouls = value ? Number(value) : null;
			}
			return newGame;
		})
	}

	public updateFullTOLs(team: 'home' | 'away', event: IonInputCustomEvent<InputChangeEventDetail>) {
		this.gameSrc.update(game => {
			const { value } = event.detail;
			var newGame = { ...game! };
			if (team == 'home') {
				newGame.home_full_tol = Number(value!);
				newGame.home_team_tol = newGame.home_full_tol + newGame.home_partial_tol;
			} else {
				newGame.away_full_tol = Number(value!);
				newGame.away_team_tol = newGame.away_full_tol + newGame.away_partial_tol;
			}
			return newGame;
		})
	}

	public updatePartialTOLs(team: 'home' | 'away', event: IonInputCustomEvent<InputChangeEventDetail>) {
		this.gameSrc.update(game => {
			const { value } = event.detail;
			var newGame = { ...game! };
			if (team == 'home') {
				newGame.home_partial_tol = Number(value!);
				newGame.home_team_tol = newGame.home_full_tol + newGame.home_partial_tol;
			} else {
				newGame.away_partial_tol = Number(value!);
				newGame.away_team_tol = newGame.away_full_tol + newGame.away_partial_tol;
			}
			return newGame;
		})
	}

	public updatePeriod(period: number) {
		this.gameSrc.update(game => ({ ...game!, period: period }));
	}
}

import { Injectable, WritableSignal, computed, effect, inject, signal, untracked } from '@angular/core';
import { GameActions, defaultPlayer, defaultStat } from '@tanager/tgs';
import { database } from 'src/app/app.db';
import { Game, Play, Player, Stat, SyncState } from 'src/app/types/models';

const playerSort = (a: Player, b: Player) => {
	if (a.number == b.number)
		return 0;
	else if (a.number < b.number)
		return -1;
	else
		return 1;
}

const calculateStatColumns = (model: Stat) => {
	const {
		freeThrowsMade, fieldGoalsMade, threesMade,
		offensiveRebounds, defensiveRebounds,
		assists, steals, blocks, fieldGoalsAttempted,
		freeThrowsAttempted, turnovers
	} = model;
	model.points = freeThrowsMade + ((fieldGoalsMade - threesMade) * 2) + (threesMade * 3);
	model.rebounds = offensiveRebounds + defensiveRebounds;
	model.eff = model.points + model.rebounds + assists + steals + blocks - (fieldGoalsAttempted - fieldGoalsMade) - (freeThrowsAttempted - freeThrowsMade) - turnovers;
}

@Injectable({
	providedIn: 'root'
})
export class GamecastService {
	private statsSrc: WritableSignal<Stat[]> = signal([]);
	public stats = this.statsSrc.asReadonly();

	private playsSrc: WritableSignal<Play[]> = signal([]);
	public plays = this.playsSrc.asReadonly();

	private playersSrc: WritableSignal<Player[]> = signal([]);
	public players = this.playersSrc.asReadonly();

	private gameSrc: WritableSignal<Game | null> = signal(null);
	public game = this.gameSrc.asReadonly();
	private gameEffect = effect(async () => {
		const game = this.game();
		if (game) {
			game.syncState = game.syncState == SyncState.Added ? SyncState.Added : SyncState.Modified;
			await database.games.put(game);
		}
	});

	public selectedPlayerId: WritableSignal<number | null> = signal(null);

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
		return players.filter(t => t.teamId == game?.homeTeam.teamId && stats.find(s => s.playerId == t.id)?.onCourt);
	});

	public awayPlayersOnCourt = computed(() => {
		const players = this.players();
		const stats = this.stats();
		const game = untracked(this.game);
		return players.filter(t => t.teamId == game?.homeTeam.teamId && stats.find(s => s.playerId == t.id)?.onCourt);
	});

	public homeTeamPlayers = computed(() => {
		const players = this.players();
		const game = untracked(this.game);
		return players.filter(t => t.teamId == game?.homeTeam.teamId).sort(playerSort);
	});

	public awayTeamPlayers = computed(() => {
		const players = this.players();
		const game = untracked(this.game);
		return players.filter(t => t.teamId == game?.awayTeam.teamId).sort(playerSort);
	});

	public hiddenPlayerIds = computed(() => {
		const stats = this.stats();
		return stats.filter(t => t.playerHidden).map(t => t.playerId);
	});

	public async fetchData(gameId: number) {
		const game = (await database.games.get(gameId))!;
		this.gameSrc.set(game);

		const stats = await database.stats.where({gameId: gameId}).toArray();
		this.statsSrc.set(stats);

		const plays = await database.plays.where({gameId: gameId}).toArray();
		this.playsSrc.set(plays);

		const players = await database.players
			.where('teamId').equals(game.homeTeam.teamId)
			.or('teamId').equals(game.awayTeam.teamId)
			.toArray();
		this.playersSrc.set(players);

		await this.setTeamPlayers(game);
	}

	private async setTeamPlayers(game: Game) {
		if (await this.sql.teamsRepo.hasTeamPlayer(game.homeTeamId) == false) {
			let teamPlayer = defaultPlayer;
			teamPlayer.firstName = 'team';
			teamPlayer.lastName = 'team';
			teamPlayer.number = -1;
			teamPlayer.syncState = SyncState.Added;
			teamPlayer.isMale = this.isMale();
			teamPlayer.teamId = game.homeTeamId;
			await this.addPlayer(teamPlayer);
		}

		if (await this.sql.teamsRepo.hasTeamPlayer(game.awayTeamId) == false) {
			let teamPlayer = defaultPlayer;
			teamPlayer.firstName = 'team';
			teamPlayer.lastName = 'team';
			teamPlayer.number = -1;
			teamPlayer.syncState = SyncState.Added;
			teamPlayer.isMale = this.isMale();
			teamPlayer.teamId = game.awayTeamId;
			await this.addPlayer(teamPlayer);
		}

		let homeTeamPlayer = this.players().find(t => t.firstName == 'team' && t.lastName == 'team' && t.number == -1 && t.teamId == game.homeTeamId)!;
		let awayTeamPlayer = this.players().find(t => t.firstName == 'team' && t.lastName == 'team' && t.number == -1 && t.teamId == game.awayTeamId)!;

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

	public async addPlayer(player: Player) {
		const id = await database.transaction('rw', 'players', () => {
			return database.players.add(player);
		});
		player.id = id;
		this.playersSrc.update(players => [...players, player]);
	}

	public async updatePlayer(playerToUpdate: Player) {
		playerToUpdate.syncState == SyncState.Added ? SyncState.Added : SyncState.Modified;
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
		const playerId = options.player ? options.player.id : this.selectedPlayerId();
		if (playerId == null) {
			throw 'What exactly are you trying to do?';
		} else {
			const prevStat = this.statsSrc().find(t => t.playerId == playerId);
			if (prevStat) {
				this.statsSrc.update(stats => stats.map(stat => {
					if (stat.playerId == playerId) {
						options.updateFn(stat);
						calculateStatColumns(stat);
						stat.syncState = stat.syncState == SyncState.Added ? SyncState.Added : SyncState.Modified;
						database.transaction('rw', 'stats', () => database.stats.put(stat));
					}
					return stat;
				}));
			} else {
				const game = this.game()!;
				const newStat = {
					...defaultStat,
					syncState: SyncState.Added,
					gameId: game.id,
					playerId: playerId
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
			this.gameSrc.set({ ...game, homeHasPossession: !game.homeHasPossession });
		}
	}

	public togglePlayerHidden(player: Player) {
		this.statsSrc.update(stats => stats.map(stat => {
			if (stat.playerId == player.id) {
				database.transaction('rw', 'stats', () => {
					database.stats.update({ playerId: stat.playerId, gameId: stat.gameId }, { 'playerHidden': !stat.playerHidden });
				});
				return { ...stat, playerHidden: !stat.playerHidden }
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
				game.awayPointsQ1 += points;
			} else if (game.period == 2) {
				game.awayPointsQ2 += points;
			} else if (game.period == 3) {
				game.awayPointsQ3 += points;
			} else if (game.period == 4) {
				game.awayPointsQ4 += points;
			} else {
				game.awayPointsOT += points;
			}
			game.awayFinal += points;
		} else {
			if (game.period == 1) {
				game.homePointsQ1 += points;
			} else if (game.period == 2) {
				game.homePointsQ2 += points;
			} else if (game.period == 3) {
				game.homePointsQ3 += points;
			} else if (game.period == 4) {
				game.homePointsQ4 += points;
			} else {
				game.homePointsOT += points;
			}
			game.homeFinal += points;
		}
		this.gameSrc.set(game);
	}

	public resetTOs() {
		const game = { ...this.game()! };
		if (game.resetTimeoutsEveryPeriod) {
			game.homeFullTOL = game.fullTimeoutsPerGame ?? 0;
			game.awayFullTOL = game.fullTimeoutsPerGame ?? 0;
			game.homePartialTOL = game.partialTimeoutsPerGame ?? 0;
			game.awayPartialTOL = game.partialTimeoutsPerGame ?? 0;
			this.gameSrc.set(game);
		}
	}

	/** Does not trigger game update for performance. Clock will naturally get synced up as other changes happen. */
	public updateClock(duration: number) {
		const minutes = Math.floor(duration / 60);
		const seconds = duration % 60;
		this.gameSrc()!.clock = `${minutes < 10 ? '0' + minutes : minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
	}

	public addPlay(team: 'home' | 'away', action: GameActions, player?: Player) {
		const plays = this.plays();
		const game = this.game()!;
		const selectedPlayer = player ?? this.selectedPlayer();
		let play: Play = {
			id: plays.length + 1,
			gameId: game.id,
			turboStatsData: null,
			sgLegacyData: null,
			syncState: SyncState.Added,
			period: game.period,
			player: selectedPlayer ? { ...selectedPlayer, playerId: selectedPlayer.id } : null,
			team: team == 'home' ? { ...game.homeTeam, name: game.homeTeam.teamName } : { ...game.awayTeam, name: game.awayTeam.teamName },
			score: `${game.homeFinal} - ${game.awayFinal}`,
			timeStamp: new Date().toJSON(),
			action: action,
			gameClock: game.clock
		}
		database.transaction('rw', 'plays', async () => {
			const existing = await database.plays.get({ gameId: game.id, id: play.id });
			if (existing && existing.syncState != SyncState.Added) {
				play.syncState = SyncState.Modified;
			}
			this.playsSrc.update(plays => [play, ...plays]);
			database.plays.put(play);
		});
	}

	public addFoulToGame(team: 'home' | 'away') {
		const game = { ...this.game()! };
		if (team == 'away') {
			if (game.awayCurrentFouls == null) {
				game.awayCurrentFouls = 1;
			} else {
				game.awayCurrentFouls++;
			}
		} else {
			if (game.homeCurrentFouls == null) {
				game.homeCurrentFouls = 1;
			} else {
				game.homeCurrentFouls++;
			}
		}
		this.gameSrc.set(game);
	}

	public addTimeoutToGame(team: 'home' | 'away', partial: boolean) {
		const game = { ...this.game()! };
		if (team == 'away') {
			if (game.awayTeamTOL > 0) {
				game.awayTeamTOL--;
			}
			if (partial && game.awayPartialTOL != null && game.awayPartialTOL > 0) {
				game.awayPartialTOL--;
			} else if (!partial && game.awayFullTOL != null && game.awayFullTOL > 0) {
				game.awayFullTOL--;
			}
		} else {
			if (game.homeTeamTOL > 0) {
				game.homeTeamTOL--;
			}
			if (partial && game.homePartialTOL != null && game.homePartialTOL > 0) {
				game.homePartialTOL--;
			} else if (!partial && game.homeFullTOL != null && game.homeFullTOL > 0) {
				game.homeFullTOL--;
			}
		}
		this.gameSrc.set(game);
	}
}

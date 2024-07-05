import { Injectable, computed, effect, signal, untracked } from '@angular/core';
import { InputChangeEventDetail } from '@ionic/angular';
import { IonInputCustomEvent } from '@ionic/core';
import { GameActions, defaultPlayer, defaultStat } from '@tanager/tgs';
import { database } from 'src/app/app.db';
import { Game, Play, Player, Stat, SyncState } from 'src/app/types/models';
import { sortBy } from 'lodash';

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

const newTeamPlayer: Player = {
	...defaultPlayer,
	syncState: SyncState.Added,
	firstName: 'team',
	lastName: 'team',
	number: '-1'
}

export type BoxScore = {
	number: string;
	name: string;
	playerId: number;
	assists: number;
	rebounds: number;
	defensiveRebounds: number;
	offensiveRebounds: number;
	fieldGoalsMade: number;
	fieldGoalsAttempted: number;
	blocks: number;
	steals: number;
	fouls: number;
	technicalFouls: number;
	plusOrMinus: number;
	points: number;
	turnovers: number;
	threesMade: number;
	threesAttempted: number;
	freeThrowsMade: number;
	freeThrowsAttempted: number;
};

export type ChangePeriodTotalsConfig = {
	totals: { p1: number, p2: number, p3: number, p4: number, ot: number },
	team: 'home' | 'away'
}

const mapStatToBoxScore = (stat: Stat, players: Player[]): BoxScore => {
	const player = players.find(t => t.id == stat.playerId)!;
	return {
		number: player.number,
		name: `${player.firstName} ${player.lastName}`,
		playerId: player.id,
		assists: stat.assists,
		rebounds: stat.rebounds,
		defensiveRebounds: stat.defensiveRebounds,
		offensiveRebounds: stat.offensiveRebounds,
		fieldGoalsMade: stat.fieldGoalsMade,
		fieldGoalsAttempted: stat.fieldGoalsAttempted,
		threesMade: stat.threesMade,
		threesAttempted: stat.threesAttempted,
		freeThrowsMade: stat.freeThrowsMade,
		freeThrowsAttempted: stat.freeThrowsAttempted,
		blocks: stat.blocks,
		steals: stat.steals,
		points: stat.points,
		turnovers: stat.turnovers,
		fouls: stat.fouls,
		technicalFouls: stat.technicalFouls ?? 0,
		plusOrMinus: stat.plusOrMinus
	}
}

const sumBoxScores = (boxScores: BoxScore[]): BoxScore => {
	let total: BoxScore = {
		number: '0',
		name: 'Totals',
		playerId: 0,
		assists: 0,
		rebounds: 0,
		defensiveRebounds: 0,
		offensiveRebounds: 0,
		fieldGoalsMade: 0,
		fieldGoalsAttempted: 0,
		blocks: 0,
		steals: 0,
		fouls: 0,
		technicalFouls: 0,
		plusOrMinus: 0,
		points: 0,
		turnovers: 0,
		threesMade: 0,
		threesAttempted: 0,
		freeThrowsMade: 0,
		freeThrowsAttempted: 0
	}
	return boxScores.reduce((result, curr) => {
		result.assists += curr.assists;
		result.rebounds += curr.rebounds;
		result.defensiveRebounds += curr.defensiveRebounds;
		result.offensiveRebounds += curr.offensiveRebounds;
		result.fieldGoalsMade += curr.fieldGoalsMade;
		result.fieldGoalsAttempted += curr.fieldGoalsAttempted;
		result.threesMade += curr.threesMade;
		result.threesAttempted += curr.threesAttempted;
		result.freeThrowsMade += curr.freeThrowsMade;
		result.freeThrowsAttempted += curr.freeThrowsAttempted;
		result.blocks += curr.blocks;
		result.steals += curr.steals;
		result.fouls += curr.fouls;
		result.technicalFouls += curr.technicalFouls;
		result.plusOrMinus += curr.plusOrMinus;
		result.points += curr.points;
		result.turnovers += curr.turnovers;
		return result;
	}, total);
}

@Injectable({
	providedIn: 'root'
})
export class GamecastService {
	private statsSrc = signal<Stat[]>([]);
	public stats = this.statsSrc.asReadonly();

	private playsSrc = signal<Play[]>([]);
	public plays = this.playsSrc.asReadonly();

	private playersSrc = signal<Player[]>([]);
	public players = this.playersSrc.asReadonly();

	private gameSrc = signal<Game | null>(null);
	public game = this.gameSrc.asReadonly();
	private gameEffect = effect(async () => {
		const game = this.game();
		if (game) {
			game.syncState = game.syncState == SyncState.Added ? SyncState.Added : SyncState.Modified;
			if (game.settings == null) {
				game.settings = {
					resetTimeouts: 4,
					fullTimeouts: 2,
					partialTimeouts: 1,
					minutesPerPeriod: 9,
					minutesPerOvertime: 4,
					resetFouls: 1
				};
			}

			await database.games.put(game);
		}
	});

	public selectedPlayerId = signal<number | null>(null);

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
		return players.filter(t => t.teamId == game?.awayTeam.teamId && stats.find(s => s.playerId == t.id)?.onCourt);
	});

	public homeTeamPlayers = computed(() => {
		const players = this.players();
		const stats = this.stats();
		const game = untracked(this.game);
		return sortBy(players.filter(t => t.teamId == game?.homeTeam.teamId), t => {
			const numberOverride = stats.find(x => x.playerId == t.id)?.playerNumber;
			return Number(numberOverride ?? t.number) || 0;
		});
	});

	public awayTeamPlayers = computed(() => {
		const players = this.players();
		const stats = this.stats();
		const game = untracked(this.game);
		return sortBy(players.filter(t => t.teamId == game?.awayTeam.teamId), t => {
			const numberOverride = stats.find(x => x.playerId == t.id)?.playerNumber;
			return Number(numberOverride ?? t.number) || 0;
		});
	});

	public hiddenPlayerIds = computed(() => {
		const stats = this.stats();
		return stats.filter(t => t.playerHidden).map(t => t.playerId);
	});

	public boxScore = computed(() => {
		const homeTeamPlayers = this.homeTeamPlayers();
		const awayTeamPlayers = this.awayTeamPlayers();
		const stats = this.stats();
		return {
			homeBoxScore: stats
				.filter(t => homeTeamPlayers.find(p => p.id == t.playerId))
				.map(t => mapStatToBoxScore(t, homeTeamPlayers)),
			awayBoxScore: stats
				.filter(t => awayTeamPlayers.find(p => p.id == t.playerId))
				.map(t => mapStatToBoxScore(t, awayTeamPlayers))
		}
	});

	public boxScoreTotals = computed(() => {
		const boxScore = this.boxScore();
		return {
			homeTotals: sumBoxScores(boxScore.homeBoxScore),
			awayTotals: sumBoxScores(boxScore.awayBoxScore)
		}
	});

	/**
	 * Forces a final game save before they leave the page
	 */
	public destroy() {
		this.gameSrc.update(game => ({ ...game! }));
	}

	public async setGame(gameId: number) {
		const game = (await database.games.get(gameId))!;
		this.gameSrc.set(game);

		const players = await database.players
			.where('teamId').equals(game.homeTeam.teamId)
			.or('teamId').equals(game.awayTeam.teamId)
			.toArray();
		this.playersSrc.set(players);

		await this.setTeamPlayers(game);

		let stats = await database.stats.where({ gameId: gameId }).toArray();
		for (let player of players) {
			if (!stats.find(t => t.playerId == player.id)) {
				stats.push({
					...defaultStat,
					playerId: player.id,
					gameId: gameId,
					syncState: SyncState.Added
				});
			}
		}
		this.statsSrc.set(stats);

		const plays = (await database.plays
			.where({ gameId: gameId })
			.and(t => t.syncState != SyncState.Deleted)
			.sortBy('id'))
			.reverse();
		this.playsSrc.set(plays);
	}

	private async setTeamPlayers(game: Game) {
		let homeTeamPlayer = await database.players.where({
			teamId: game.homeTeam.teamId,
			firstName: 'team',
			lastName: 'team'
		}).first();
		let awayTeamPlayer = await database.players.where({
			teamId: game.awayTeam.teamId,
			firstName: 'team',
			lastName: 'team'
		}).first();

		if (!homeTeamPlayer) {
			homeTeamPlayer = {
				...newTeamPlayer,
				isMale: game.homeTeam.isMale,
				teamId: game.homeTeam.teamId
			}
			await this.addPlayer(homeTeamPlayer);
		}

		if (!awayTeamPlayer) {
			awayTeamPlayer = {
				...newTeamPlayer,
				isMale: game.awayTeam.isMale,
				teamId: game.awayTeam.teamId
			}
			await this.addPlayer(awayTeamPlayer);
		}

		if (!this.homePlayersOnCourt().find(t => t.id == homeTeamPlayer!.id)) {
			this.updateStat({
				player: homeTeamPlayer,
				updateFn: stat => stat.onCourt = true
			});
		}

		if (!this.awayPlayersOnCourt().find(t => t.id == awayTeamPlayer!.id)) {
			this.updateStat({
				player: awayTeamPlayer,
				updateFn: stat => stat.onCourt = true
			});
		}
	}

	public async addPlayer(player: Player) {
		const newPlyaer = {
			...defaultPlayer,
			id: undefined!,
			syncState: SyncState.Added,
			firstName: player.firstName,
			lastName: player.lastName,
			isMale: player.isMale,
			number: player.number,
			teamId: player.teamId
		};
		const id = await database.transaction('rw', 'players', () => database.players.add(newPlyaer));
		player.id = id;
		this.playersSrc.update(players => [...players, player]);
		this.statsSrc.update(stats => [...stats, {
			...defaultStat,
			playerId: id,
			gameId: this.game()!.id,
			syncState: SyncState.Added
		}]);
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

	public changePeriodTotals(config: ChangePeriodTotalsConfig) {
		const game = { ...this.game()! };
		const { p1, p2, p3, p4, ot } = config.totals;
		if (config.team == 'away') {
			game.awayPointsQ1 = p1;
			game.awayPointsQ2 = p2;
			game.awayPointsQ3 = p3;
			game.awayPointsQ4 = p4;
			game.awayPointsOT = ot;
			game.awayFinal = p1 + p2 + p2 + p4 + ot;
		} else {
			game.homePointsQ1 = p1;
			game.homePointsQ2 = p2;
			game.homePointsQ3 = p3;
			game.homePointsQ4 = p4;
			game.homePointsOT = ot;
			game.homeFinal = p1 + p2 + p2 + p4 + ot;
		}
		this.gameSrc.set(game);
	}

	public resetTOs() {
		const game = { ...this.game()! };
		if (game.settings?.resetTimeouts == 1 || game.settings?.resetTimeouts == 2) {
			game.homeFullTOL = game.settings?.fullTimeouts ?? 0;
			game.awayFullTOL = game.settings?.fullTimeouts ?? 0;
			game.homePartialTOL = game.settings?.partialTimeouts ?? 0;
			game.awayPartialTOL = game.settings?.partialTimeouts ?? 0;
			this.gameSrc.set(game);
		}
		if (game.settings?.resetTimeouts == 3 || game.settings?.resetTimeouts == 4) {
			game.homeFullTOL = game.settings?.fullTimeouts ?? 0;
			game.awayFullTOL = game.settings?.fullTimeouts ?? 0;
			this.gameSrc.set(game);
		}
	}

	public resetFouls() {
		const game = { ...this.game()! };
		game.homeCurrentFouls = 0;
		game.awayCurrentFouls = 0;
		this.gameSrc.set(game);
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
			player: selectedPlayer && (action != GameActions.FullTO && action != GameActions.PartialTO) ? { ...selectedPlayer, playerId: selectedPlayer.id } : null,
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

	public updatePlusOrMinus(homePOMToAdd: number, awayPOMToAdd: number) {
		const game = this.game()!;
		database.transaction('rw', 'stats', () => {
			database.stats
				.where('playerId')
				.anyOf(this.homePlayersOnCourt().map(t => t.id))
				.and(t => t.gameId == game.id)
				.modify(stat => { stat.plusOrMinus += homePOMToAdd });
			database.stats
				.where('playerId')
				.anyOf(this.awayPlayersOnCourt().map(t => t.id))
				.and(t => t.gameId == game.id)
				.modify(stat => { stat.plusOrMinus += awayPOMToAdd })
		});
	}

	public removeLastPlay() {
		let play = this.plays()[0];
		this.undoAction(play);
		this.playsSrc.update(plays => plays.slice(1));
		database.transaction('rw', 'plays', async () => {
			if (play.syncState == SyncState.Added) {
				database.plays.where({ gameId: play.gameId, id: play.id }).delete();
			} else {
				database.plays.update(play, { syncState: SyncState.Deleted });
			}
		});
	}

	public updatePlay(play: Play) {
		this.playsSrc.update(plays => {
			const playToUpdateIndex = plays.findIndex(t => t.id == play.id && t.gameId == play.gameId);
			const playToUpdate = { ...plays[playToUpdateIndex] };
			this.undoAction(playToUpdate)
			this.redoAction(play);
			play.score = `${this.game()?.homeFinal} - ${this.game()?.awayFinal}`;
			play.syncState = play.syncState == SyncState.Added ? SyncState.Added : SyncState.Modified;
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
		const player = this.players().find(t => t.id == play.player?.playerId);
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
				updateFn: stat => stat.defensiveRebounds--
			});
		} else if (play.action == GameActions.Foul) {
			this.updateStat({
				player: player,
				updateFn: stat => stat.fouls--
			});
			if (player?.teamId === game.homeTeam.teamId) {
				game.homeCurrentFouls!--;
			} else {
				game.awayCurrentFouls!--;
			}
		} else if (play.action == GameActions.FreeThrowMade) {
			this.updateStat({
				player: player,
				updateFn: stat => {
					stat.freeThrowsMade--
					stat.freeThrowsAttempted--
				}
			});
			if (player?.teamId == game.homeTeam.teamId) {
				if (play.period == 1) {
					game.homePointsQ1--;
				} else if (play.period == 2) {
					game.homePointsQ2--;
				} else if (play.period == 3 && !game.hasFourQuarters) {
					game.homePointsOT--;
				} else if (play.period == 3 && game.hasFourQuarters) {
					game.homePointsQ3--;
				} else if (play.period == 4) {
					game.homePointsQ4--;
				} else if (play.period == 5) {
					game.homePointsOT--;
				}
				game.homeFinal--;
			} else {
				if (play.period == 1) {
					game.awayPointsQ1--;
				} else if (play.period == 2) {
					game.awayPointsQ2--;
				} else if (play.period == 3 && !game.hasFourQuarters) {
					game.awayPointsOT--;
				} else if (play.period == 3 && game.hasFourQuarters) {
					game.awayPointsQ3--;
				} else if (play.period == 4) {
					game.awayPointsQ4--;
				} else if (play.period == 5) {
					game.awayPointsOT--;
				}
				game.awayFinal--;
			}
		} else if (play.action == GameActions.FreeThrowMissed) {
			this.updateStat({
				player: player,
				updateFn: stat => stat.freeThrowsAttempted--
			});
		} else if (play.action == GameActions.FullTO) {
			if (play.team?.teamId == game.homeTeam.teamId) {
				game.homeTeamTOL++;
				game.homeFullTOL!++;
			} else {
				game.awayTeamTOL++;
				game.awayFullTOL!++;
			}
		} else if (play.action == GameActions.OffRebound) {
			this.updateStat({
				player: player,
				updateFn: stat => stat.offensiveRebounds--
			});
		} else if (play.action == GameActions.PartialTO) {
			if (play.team?.teamId == game.homeTeam.teamId) {
				game.homeTeamTOL++;
				game.homePartialTOL!++;
			} else {
				game.awayTeamTOL++;
				game.awayPartialTOL!++;
			}
		} else if (play.action == GameActions.ShotMade) {
			this.updateStat({
				player: player,
				updateFn: stat => {
					stat.fieldGoalsAttempted--
					stat.fieldGoalsMade--
				}
			});
			if (player?.teamId == game.homeTeam.teamId) {
				if (play.period == 1) {
					game.homePointsQ1 -= 2;
				} else if (play.period == 2) {
					game.homePointsQ2 -= 2;
				} else if (play.period == 3 && !game.hasFourQuarters) {
					game.homePointsOT -= 2;
				} else if (play.period == 3 && game.hasFourQuarters) {
					game.homePointsQ3 -= 2;
				} else if (play.period == 4) {
					game.homePointsQ4 -= 2;
				} else if (play.period == 5) {
					game.homePointsOT -= 2;
				}
				game.homeFinal -= 2;
			} else {
				if (play.period == 1) {
					game.awayPointsQ1 -= 2;
				} else if (play.period == 2) {
					game.awayPointsQ2 -= 2;
				} else if (play.period == 3 && !game.hasFourQuarters) {
					game.awayPointsOT -= 2;
				} else if (play.period == 3 && game.hasFourQuarters) {
					game.awayPointsQ3 -= 2;
				} else if (play.period == 4) {
					game.awayPointsQ4 -= 2;
				} else if (play.period == 5) {
					game.awayPointsOT -= 2;
				}
				game.awayFinal -= 2;
			}
		} else if (play.action == GameActions.ShotMissed) {
			this.updateStat({
				player: player,
				updateFn: stat => stat.fieldGoalsAttempted--
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
					stat.threesAttempted--
					stat.threesMade--
					stat.fieldGoalsAttempted--
					stat.fieldGoalsMade--
				}
			});
			if (player?.teamId == game.homeTeam.teamId) {
				if (play.period == 1) {
					game.homePointsQ1 -= 3;
				} else if (play.period == 2) {
					game.homePointsQ2 -= 3;
				} else if (play.period == 3 && !game.hasFourQuarters) {
					game.homePointsOT -= 3;
				} else if (play.period == 3 && game.hasFourQuarters) {
					game.homePointsQ3 -= 3;
				} else if (play.period == 4) {
					game.homePointsQ4 -= 3;
				} else if (play.period == 5) {
					game.homePointsOT -= 3;
				}
				game.homeFinal -= 3;
			} else {
				if (play.period == 1) {
					game.awayPointsQ1 -= 3;
				} else if (play.period == 2) {
					game.awayPointsQ2 -= 3;
				} else if (play.period == 3 && !game.hasFourQuarters) {
					game.awayPointsOT -= 3;
				} else if (play.period == 3 && game.hasFourQuarters) {
					game.awayPointsQ3 -= 3;
				} else if (play.period == 4) {
					game.awayPointsQ4 -= 3;
				} else if (play.period == 5) {
					game.awayPointsOT -= 3;
				}
				game.awayFinal -= 3;
			}
		} else if (play.action == GameActions.ThreeMissed) {
			this.updateStat({
				player: player,
				updateFn: stat => {
					stat.threesAttempted--
					stat.fieldGoalsAttempted--
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
		const player = this.players().find(t => t.id == play.player?.playerId);
		let updateFn: (stat: Stat) => void = () => { };
		if (play.action == GameActions.Assist) {
			updateFn = stat => stat.assists++
		} else if (play.action == GameActions.Block) {
			updateFn = stat => stat.blocks++
		} else if (play.action == GameActions.DefRebound) {
			updateFn = stat => stat.defensiveRebounds++
		} else if (play.action == GameActions.Foul) {
			updateFn = stat => stat.fouls++
			if (player?.teamId == game.homeTeam.teamId) {
				game.homeCurrentFouls!++;
			} else {
				game.awayCurrentFouls!++;
			}
		} else if (play.action == GameActions.FreeThrowMade) {
			updateFn = stat => {
				stat.freeThrowsAttempted++
				stat.freeThrowsMade++
			}
			if (player?.teamId == game.homeTeam.teamId) {
				if (play.period == 1) {
					game.homePointsQ1++;
				} else if (play.period == 2) {
					game.homePointsQ2++;
				} else if (play.period == 3 && !game.hasFourQuarters) {
					game.homePointsOT++;
				} else if (play.period == 3 && game.hasFourQuarters) {
					game.homePointsQ3++;
				} else if (play.period == 4) {
					game.homePointsQ4++;
				} else if (play.period == 5) {
					game.homePointsOT++;
				}
				game.homeFinal++;
			} else {
				if (play.period == 1) {
					game.awayPointsQ1++;
				} else if (play.period == 2) {
					game.awayPointsQ2++;
				} else if (play.period == 3 && !game.hasFourQuarters) {
					game.awayPointsOT++;
				} else if (play.period == 3 && game.hasFourQuarters) {
					game.awayPointsQ3++;
				} else if (play.period == 4) {
					game.awayPointsQ4++;
				} else if (play.period == 5) {
					game.awayPointsOT++;
				}
				game.awayFinal++;
			}
		} else if (play.action == GameActions.FreeThrowMissed) {
			updateFn = stat => stat.freeThrowsAttempted++
		} else if (play.action == GameActions.FullTO) {
			if (play.team?.name == game.homeTeam.teamName) {
				game.homeTeamTOL--;
				game.homeFullTOL!--;
			} else {
				game.awayTeamTOL--;
				game.awayFullTOL!--;
			}
		} else if (play.action == GameActions.OffRebound) {
			updateFn = stat => stat.offensiveRebounds++
		} else if (play.action == GameActions.PartialTO) {
			if (play.team?.name == game.homeTeam.teamName) {
				game.homeTeamTOL--;
				game.homePartialTOL!--;
			} else {
				game.awayTeamTOL--;
				game.awayPartialTOL!--;
			}
		} else if (play.action == GameActions.ShotMade) {
			updateFn = stat => {
				stat.fieldGoalsAttempted++
				stat.fieldGoalsMade++
			}
			if (player?.teamId == game.homeTeam.teamId) {
				if (play.period == 1) {
					game.homePointsQ1 += 2;
				} else if (play.period == 2) {
					game.homePointsQ2 += 2;
				} else if (play.period == 3 && !game.hasFourQuarters) {
					game.homePointsOT += 2;
				} else if (play.period == 3 && game.hasFourQuarters) {
					game.homePointsQ3 += 2;
				} else if (play.period == 4) {
					game.homePointsQ4 += 2;
				} else if (play.period == 5) {
					game.homePointsOT += 2;
				}
				game.homeFinal += 2;
			} else {
				if (play.period == 1) {
					game.awayPointsQ1 += 2;
				} else if (play.period == 2) {
					game.awayPointsQ2 += 2;
				} else if (play.period == 3 && !game.hasFourQuarters) {
					game.awayPointsOT += 2;
				} else if (play.period == 3 && game.hasFourQuarters) {
					game.awayPointsQ3 += 2;
				} else if (play.period == 4) {
					game.awayPointsQ4 += 2;
				} else if (play.period == 5) {
					game.awayPointsOT += 2;
				}
				game.awayFinal += 2;
			}
		} else if (play.action == GameActions.ShotMissed) {
			updateFn = stat => stat.fieldGoalsAttempted++
		} else if (play.action == GameActions.Steal) {
			updateFn = stat => stat.steals++
		} else if (play.action == GameActions.ThreeMade) {
			updateFn = stat => {
				stat.fieldGoalsAttempted++
				stat.fieldGoalsMade++
				stat.threesAttempted++
				stat.threesMade++
			}
			if (player?.teamId == game.homeTeam.teamId) {
				if (play.period == 1) {
					game.homePointsQ1 += 3;
				} else if (play.period == 2) {
					game.homePointsQ2 += 3;
				} else if (play.period == 3 && !game.hasFourQuarters) {
					game.homePointsOT += 3;
				} else if (play.period == 3 && game.hasFourQuarters) {
					game.homePointsQ3 += 3;
				} else if (play.period == 4) {
					game.homePointsQ4 += 3;
				} else if (play.period == 5) {
					game.homePointsOT += 3;
				}
				game.homeFinal += 3;
			} else {
				if (play.period == 1) {
					game.awayPointsQ1 += 3;
				} else if (play.period == 2) {
					game.awayPointsQ2 += 3;
				} else if (play.period == 3 && !game.hasFourQuarters) {
					game.awayPointsOT += 3;
				} else if (play.period == 3 && game.hasFourQuarters) {
					game.awayPointsQ3 += 3;
				} else if (play.period == 4) {
					game.awayPointsQ4 += 3;
				} else if (play.period == 5) {
					game.awayPointsOT += 3;
				}
				game.awayFinal += 3;
			}
		} else if (play.action == GameActions.ThreeMissed) {
			updateFn = stat => {
				stat.threesAttempted++
				stat.fieldGoalsAttempted++
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
				newGame.homeCurrentFouls = value ? Number(value) : null;
			} else {
				newGame.awayCurrentFouls = value ? Number(value) : null;
			}
			return newGame;
		})
	}

	public updateFullTOLs(team: 'home' | 'away', event: IonInputCustomEvent<InputChangeEventDetail>) {
		this.gameSrc.update(game => {
			const { value } = event.detail;
			var newGame = { ...game! };
			if (team == 'home') {
				newGame.homeFullTOL = Number(value!);
				newGame.homeTeamTOL = newGame.homeFullTOL + newGame.homePartialTOL;
			} else {
				newGame.awayFullTOL = Number(value!);
				newGame.awayTeamTOL = newGame.awayFullTOL + newGame.awayPartialTOL;
			}
			return newGame;
		})
	}

	public updatePartialTOLs(team: 'home' | 'away', event: IonInputCustomEvent<InputChangeEventDetail>) {
		this.gameSrc.update(game => {
			const { value } = event.detail;
			var newGame = { ...game! };
			if (team == 'home') {
				newGame.homePartialTOL = Number(value!);
				newGame.homeTeamTOL = newGame.homeFullTOL + newGame.homePartialTOL;
			} else {
				newGame.awayPartialTOL = Number(value!);
				newGame.awayTeamTOL = newGame.awayFullTOL + newGame.awayPartialTOL;
			}
			return newGame;
		})
	}

	public updatePeriod(period: number) {
		this.gameSrc.update(game => ({ ...game!, period: period }));
	}
}

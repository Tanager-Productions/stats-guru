import { Component, EventEmitter } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, Observable, Subscription, interval, map, throwError } from 'rxjs';
import { Game } from 'src/app/interfaces/game.interface';
import { Player } from 'src/app/interfaces/player.interface';
import { CrudService } from 'src/app/services/crud/crud.service';
import { SqlService } from 'src/app/services/sql/sql.service';
import { SyncState } from 'src/app/interfaces/syncState.enum';
import { Stat } from 'src/app/interfaces/stat.interface';
import { Play } from 'src/app/interfaces/play.interface';
import { SQLiteDBConnection } from '@capacitor-community/sqlite';
import { ColDef, GridApi } from 'ag-grid-community';
import { GameCastSettings } from 'src/app/interfaces/gameCastSetting.interface';
import { ApiService } from 'src/app/services/api/api.service';
import { GamecastDto } from 'src/app/interfaces/gamecastDto.interface';
import { currentDatabaseVersion } from 'src/app/upgrades/versions';
import { SyncMode } from 'src/app/interfaces/sync.interface';
import { GamecastResult } from 'src/app/interfaces/gamecastResult.interface';
import { AuthService } from 'src/app/services/auth/auth.service';

export enum GameActions {
	OffRebound = 5,
	DefRebound = 10,
	Assist = 15,
	Block = 20,
	Steal = 25,
	Foul = 30,
	Turnover = 35,
	ShotMade = 40,
	ShotMissed = 45,
	ThreeMade = 50,
	ThreeMissed = 55,
	FreeThrowMissed = 60,
	FreeThrowMade = 65,
	FullTO = 70,
	PartialTO = 75
}

type StatsRow =  {
  game: number,
  modified: boolean,
  player: number,
  blocks: number,
  fieldGoalsAttempted: number,
  fieldGoalsMade: number,
  fouls: number,
  freethrowsAttempted: number,
  freethrowsMade: number,
  minutes: number,
  plusOrMinus: number,
  points: number,
  rebounds: number,
  defensiveRebounds: number,
  offensiveRebounds: number,
  steals: number,
  threesAttempted: number,
  threesMade: number,
  turnovers: number,
	technicalFouls: number
}

@Component({
  selector: 'app-gamecast',
  templateUrl: './gamecast.component.html',
  styleUrls: ['./gamecast.component.scss'],
})
export class GamecastComponent {
	db!:SQLiteDBConnection;
  gameId!: string;
  currentGame?: Game;
	homeTeamPlayers?: Player[];
	awayTeamPlayers?: Player[];
	homeTeamStats!: StatsRow[];
	awayTeamStats!: StatsRow[];
	homePlayersOnCourt: Player[] = [];
	awayPlayersOnCourt: Player[] = [];
	stats?: Stat[];
	plays?: Play[];
	homeTeamFouls: number = 0;
	awayTeamFouls: number = 0;
  timerSubscription?: Subscription;
  timerDuration: number = 8 * 60;
  timeLeft: number = this.timerDuration;
  timerRunning: boolean = false;
	newPlayerNumber: string = '';
	homePlayerSelected: number = -1;
	awayPlayerSelected: number = -1;
	editPlayer: boolean = false;
	statsTab: 'home' | 'away' = 'home';
	gameCastSettings?: GameCastSettings;
	gameActions = GameActions;
	actions: {key:number, value:string}[] = Object.entries(GameActions)
																						.reverse()
																						.slice(0,15)
																						.map(t => {
																							return { key:Number(t[1]), value:t[0] as string }
																						});
	homeStatGridApi!: GridApi<StatsRow>;
	awayStatGridApi!: GridApi<StatsRow>;
	addHomePlayer:boolean = true;
	showAddPlayer:boolean = false;

	//Displaying Auto-Complete Options:
	reboundDisplay: boolean = false;
	stealDisplay: boolean = false;
	assistDisplay: boolean = false;

	public teamStats: ColDef[] = [
		{field: 'number', headerName: 'NUM', pinned: true, editable: false},
		{field: 'firstName', headerName: 'First Name', editable: false},
		{field: 'lastName', headerName: 'Last Name', editable: false},
		{field: 'minutes', headerName: 'MIN', width: 80},
		{field: 'rebounds', headerName: 'REB', width: 80, editable: false},
		{field: 'defensiveRebounds', headerName: 'DREB', width: 90},
		{field: 'offensiveRebounds', headerName: 'OREB', width: 90},
		{field: 'fieldGoalsMade', headerName: 'FGM', width: 90},
		{field: 'fieldGoalsAttempted', headerName: 'FGA', width: 80},
		{field: 'blocks', headerName: 'BLK', width: 80},
		{field: 'steals', headerName: 'STL', width: 80},
		{field: 'threesMade', headerName: '3FGM', width: 90},
		{field: 'threesAttempted', headerName: '3FGA', width: 90},
		{field: 'freethrowsMade', headerName: 'FTM', width: 80},
		{field: 'freethrowsAttempted', headerName: 'FTA', width: 80},
		{field: 'points', headerName: 'PTS', width: 80, editable: false},
		{field: 'turnovers', headerName: 'TO', width: 80},
		{field: 'fouls', headerName: 'FOUL', width: 90},
		{field: 'technicalFouls', headerName: 'TECH', width: 90},
		{field: 'plusOrMinus', headerName: '+/-', width: 80},
	];

  constructor(
		private route: ActivatedRoute,
		private crud: CrudService,
		private sql: SqlService,
		private api:ApiService,
		private auth: AuthService) {}

  ngOnInit() {
    this.route.params.subscribe((params: { [x: string]: string }) => {
      this.gameId = params['gameId'];
			this.fetchData()
				/*.then(async () => {
					let ticket = (await this.api.GenerateTicket()).data;
					this.socket = new WebSocket(`${this.socketUrl}/WebSocket/GameCast?ticket=${ticket}&userId=${this.auth.getUser()?.userId}`);
					this.socket.onopen = () => this.send();
					this.socket.onclose = () => console.log('Socket closed!');
					this.socket.onmessage = async (mess) => {
						let res:GamecastResult = JSON.parse(mess.data);
						if (!res.result) console.error('Socket sync failed!', res.error);
						if (res.resetGame) {
							await this.updateGame(SyncState.Unchanged);
						}
						if (res.resetStats) {
							await this.crud.rawExecute(this.db, `Update Stats set syncState = 0 where game = ${this.gameId}`);
						}
						if (res.resetPlays) {
							await this.crud.rawExecute(this.db, `Update Plays set syncState = 0 where gameId = ${this.gameId}`);
						}
						for (let item of res.playersToReset) {
							let player = this.homeTeamPlayers!.find(t => t.playerId == item);
							if (player == undefined) {
								player = this.awayTeamPlayers!.find(t => t.playerId == item);
							}
							player!.syncState = SyncState.Unchanged;
							await this.crud.save(this.db, "Players", player!, {"playerId": `${item}`});
						}
						this.sending = false;
						for (let promise of this.executionQueue) {
							console.log('here');
							await Promise.resolve(promise);
						}
						this.executionQueue = [];
						if (this.socketNeedsClose) {
							this.socket?.close();
						} else {
							setTimeout(() => {
								if (this.socket && this.socket.readyState == WebSocket.OPEN) {
									this.sending = true;
									this.send();
								}
							}, 15000);
						}
					}
				});*/
    });
  }

	/*private send() {
		let players = this.homeTeamPlayers!.slice();
		players.push(...this.awayTeamPlayers!);
		let dto: GamecastDto = {
			game: this.currentGame!,
			version: currentDatabaseVersion,
			overwrite: null,
			mode: SyncMode.Full,
			stats: this.stats!.filter(t => t.syncState == SyncState.Added || t.syncState == SyncState.Modified),
			players: players.filter(t => t.syncState == SyncState.Added || t.syncState == SyncState.Modified),
			plays: this.plays!.filter(t => t.syncState != SyncState.Unchanged)
		}
		this.socket!.send(JSON.stringify(dto));
	}*/

	editingStopped(event: any) {
    let updatedStat: Stat = {
			player: event.data.player,
			game: this.gameId,
			minutes: event.data.minutes,
			assists: event.data.assists,
			rebounds: event.data.rebounds,
			defensiveRebounds: event.data.defensiveRebounds,
			offensiveRebounds: event.data.offensiveRebounds,
			fieldGoalsMade: event.data.fieldGoalsMade,
			fieldGoalsAttempted: event.data.fieldGoalsAttempted,
			blocks: event.data.blocks,
			steals: event.data.steals,
			threesMade: event.data.threesMade,
			threesAttempted: event.data.threesAttempted,
			freeThrowsMade: event.data.freeThrowsMade,
			freeThrowsAttempted: event.data.freeThrowsMade,
			points: event.data.points,
			turnovers: event.data.turnovers,
			fouls: event.data.fouls,
			plusOrMinus: event.data.plusOrMinus,
			eff: event.data.eff,
			syncState: event.data.syncState = SyncState.Modified,
			technicalFouls: event.data.technicalFouls
		}
		this.saveStat(updatedStat);
  }

	async addPlayer(player:Player) {
		if (this.addHomePlayer) {
			this.homeTeamPlayers!.push(player);
		} else {
			this.awayTeamPlayers!.push(player);
		}
		await this.crud.save(this.db, 'Players', player)
	}

	private async fetchData() {
		this.db = await this.sql.createConnection();
		let res = await this.crud.rawQuery(this.db, `SELECT * FROM GameCastSettings WHERE game = '${this.gameId}'`);
		if (res.length == 0) {
			let gameCastSetting: GameCastSettings = {
				id: 0,
				partialTimeouts: 0,
				fullTimeouts: 2,
				periodsPerGame: 2,
				minutesPerPeriod: 18,
				minutesPerOvertime: 10,
				game: this.gameId,
				homePlayersOnCourt: null,
				awayPlayersOnCourt: null,
				resetTimeoutsEveryPeriod: "true",
				homePartialTOL: null,
				awayPartialTOL: null,
				homeFullTOL: null,
				awayFullTOL: null,
				homeCurrentFouls: null,
				awayCurrentFouls: null
			}
			await this.crud.save(this.db, 'GameCastSettings', gameCastSetting);
			this.gameCastSettings = (await this.crud.rawQuery(this.db, `SELECT * FROM GameCastSettings WHERE game = '${this.gameId}'`))[0];
		} else {
			this.gameCastSettings = res[0];
		}
		this.currentGame = (await this.crud.rawQuery(this.db, `
			SELECT 	*
			FROM 		Games
			WHERE 	gameId = '${this.gameId}'
		`))[0];
    this.homeTeamPlayers = await this.crud.rawQuery(this.db, `
			SELECT 		*
			FROM 			Players
			WHERE 		team = '${this.currentGame?.homeTeam}'
			AND 			isMale = ${this.currentGame?.isMale}
			ORDER BY 	number ASC;
		`);
    this.awayTeamPlayers = await this.crud.rawQuery(this.db, `
			SELECT 		*
			FROM 			Players
			WHERE 		team = '${this.currentGame?.awayTeam}'
			AND 			isMale = ${this.currentGame?.isMale}
			ORDER BY 	number ASC;
		`);
		this.stats = await this.crud.rawQuery(this.db, `
			SELECT	*
			FROM 		Stats
			WHERE 	game = '${this.gameId}';
		`);
		this.plays = await this.crud.rawQuery(this.db, `
			SELECT 		*
			FROM 			Plays
			WHERE 		gameId = '${this.gameId}'
			ORDER BY	playId DESC
		`);
		if (this.gameCastSettings!.homePlayersOnCourt != null) {
			this.homePlayersOnCourt = this.homeTeamPlayers?.filter(t => this.gameCastSettings!.homePlayersOnCourt!.split(',').includes(t.playerId.toString()))!;
		}
		if (this.gameCastSettings!.awayPlayersOnCourt != null) {
			this.awayPlayersOnCourt = this.awayTeamPlayers?.filter(t => this.gameCastSettings!.awayPlayersOnCourt!.split(',').includes(t.playerId.toString()))!;
		}
	}

	async loadBoxScore() {
		this.homeTeamStats = await this.crud.rawQuery(this.db, `
			SELECT			Players.number, Players.firstName, Players.lastName, Stats.player, Stats.minutes, Stats.rebounds, Stats.defensiveRebounds,
									Stats.offensiveRebounds, Stats.fieldGoalsMade, Stats.fieldGoalsAttempted, Stats.blocks, Stats.steals, Stats.threesMade,
									Stats.threesAttempted, Stats.freethrowsMade, Stats.freethrowsAttempted, Stats.points, Stats.turnovers,
									Stats.fouls, Stats.technicalFouls, Stats.plusOrMinus
			FROM				Stats
			JOIN				Players ON Stats.player = Players.playerId
			WHERE 			Players.team = '${this.currentGame?.homeTeam}'
			AND					Stats.game = '${this.gameId}'
			ORDER BY 		Players.number;
		`);
		this.awayTeamStats = await this.crud.rawQuery(this.db, `
			SELECT		Players.number, Players.firstName, Players.lastName, Stats.player, Stats.minutes, Stats.rebounds, Stats.defensiveRebounds,
								Stats.offensiveRebounds, Stats.fieldGoalsMade, Stats.fieldGoalsAttempted, Stats.blocks, Stats.steals, Stats.threesMade,
								Stats.threesAttempted, Stats.freethrowsMade, Stats.freethrowsAttempted, Stats.points, Stats.turnovers,
								Stats.fouls, Stats.technicalFouls, Stats.plusOrMinus
			FROM			Stats
			JOIN			Players ON Stats.player = Players.playerId
			WHERE 		Players.team = '${this.currentGame?.awayTeam}'
			AND				Stats.game = '${this.gameId}'
			ORDER BY 	Players.number;
		`);
	}

	async savePlayer(player: Player) {
		player.syncState = SyncState.Modified;
		await this.crud.save(this.db, "Players", player, {"playerId": `'${player.playerId}'`});
		this.editPlayer = false;
	}

  inputNumber (numberClicked: number) {
    if (this.newPlayerNumber.length < 3) {
      this.newPlayerNumber += numberClicked;
    }
  }

  clearNumberInput() {
    this.newPlayerNumber = '';
  }

  async addToTeam(team: 'home' | 'away') {
    let newTeamPlayer: Player = {
      playerId: crypto.randomUUID(),
      firstName: "New",
      lastName: "Player",
      number: Number(this.newPlayerNumber),
      position: "",
      team: team == 'home' ? this.currentGame!.homeTeam : this.currentGame!.awayTeam,
      picture: null,
      isMale: this.currentGame!.isMale!,
      syncState: SyncState.Added,
			height: null,
			weight: null,
			age: null,
			homeState: null,
			homeTown: null,
			socialMediaString: null
    }

		if (team == 'home') {
			this.homeTeamPlayers!.push(newTeamPlayer);
		} else {
			this.awayTeamPlayers!.push(newTeamPlayer);
		}

    this.clearNumberInput();

		await this.crud.save(this.db, "Players", newTeamPlayer);
  }

	toggleGameComplete() {
		if(this.currentGame!.complete == '1') {
			this.currentGame!.complete = '0';
			this.updateGame();
		} else {
			this.currentGame!.complete = '1';
			this.updateGame();
		}
	}

	addToCourt(team: 'home' | 'away', player: Player) {
		if (team == 'home') {
			if (this.homePlayersOnCourt.length < 5) {
				this.homePlayersOnCourt.push(player);
				this.gameCastSettings!.homePlayersOnCourt = this.homePlayersOnCourt.map(t => t.playerId).toString();
			}
		} else {
			if (this.awayPlayersOnCourt.length < 5) {
				this.awayPlayersOnCourt.push(player);
				this.gameCastSettings!.awayPlayersOnCourt = this.awayPlayersOnCourt.map(t => t.playerId).toString();
			}
		}
		this.updateGameCastSetting();
	}

	selectPlayer(team: 'home' | 'away', index: number) {
		var prevPlayerWasHome = this.awayPlayerSelected == -1;
		if (team == 'away') {
			if (this.awayPlayerSelected == index) {
				this.awayPlayerSelected = -1;
			} else {
				this.awayPlayerSelected = index;
				this.homePlayerSelected = -1;
			}
		} else {
			if (this.homePlayerSelected == index) {
				this.homePlayerSelected = -1;
			} else {
				this.homePlayerSelected = index;
				this.awayPlayerSelected = -1;
			}
		}

		//auto complete
		if (this.stealDisplay) {
			this.addTurnover(team);
			this.stealDisplay = false;
		} else if (this.reboundDisplay) {
			if ((prevPlayerWasHome && team == 'home') || (!prevPlayerWasHome && team == 'away')) {
				this.addRebound(team, true);
			} else if ((prevPlayerWasHome && team == 'away') || (!prevPlayerWasHome && team == 'home')) {
				this.addRebound(team, false);
			}
			this.reboundDisplay = false;
		} else if (this.assistDisplay) {
			this.addAssist(team);
			this.assistDisplay = false;
		}
	}

  removeFromCourt (team: 'home' | 'away', player: Player, index:number) {
		if (team == 'away') {
			if (this.awayPlayerSelected == index) {
				this.awayPlayerSelected = -1;
			}
			this.awayPlayersOnCourt.splice(this.awayPlayersOnCourt.indexOf(player), 1);
			this.gameCastSettings!.awayPlayersOnCourt = this.awayPlayersOnCourt.map(t => t.playerId).toString();
		} else {
			if (this.homePlayerSelected == index) {
				this.homePlayerSelected = -1;
			}
			this.homePlayersOnCourt.splice(this.homePlayersOnCourt.indexOf(player), 1);
			this.gameCastSettings!.homePlayersOnCourt = this.homePlayersOnCourt.map(t => t.playerId).toString();
		}
		this.updateGameCastSetting();
  }

	public updatePlayerPlay($event:any, play:Play) {
		if ($event.detail.value == null) {
			play.playerNumber = null;
			play.playerName = null;
		} else {
			play.playerNumber = $event.detail.value.number;
			play.playerName = `${$event.detail.value.firstName} ${$event.detail.value.lastName}`;
		}
		this.updatePlay(play);
	}

	private async getStat(playerId:string) {
		let stat = this.stats!.find(t => t.player == playerId);
		if (stat == undefined) {
			let newStat:Stat = {
				game: this.gameId!,
				player: playerId,
				steals: 0,
				assists: 0,
				rebounds: 0,
				offensiveRebounds: 0,
				plusOrMinus: 0,
				technicalFouls: 0,
				threesAttempted: 0,
				threesMade: 0,
				fieldGoalsAttempted: 0,
				fieldGoalsMade: 0,
				freeThrowsAttempted: 0,
				fouls: 0,
				freeThrowsMade: 0,
				minutes: 0,
				defensiveRebounds: 0,
				blocks: 0,
				turnovers: 0,
				syncState: SyncState.Added,
				points: 0,
				eff: 0
			}
			await this.crud.save(this.db, "Stats", newStat);
			this.stats = await this.crud.rawQuery(this.db, `
				SELECT	*
				FROM 		Stats
				WHERE 	game = '${this.gameId}';
			`);
			return this.stats!.find(t => t.player == playerId)!;
		} else {
			return stat;
		}
	}

	private async saveStat(stat:Stat) {
		await this.crud.save(this.db, "Stats", stat, {"player": `'${stat.player}'`, "game": `'${this.gameId}'`});
		stat = (await this.crud.rawQuery(this.db, `select * from Stats where player = '${stat.player}' and game = '${stat.game}'`))[0];
	}

	private async updatePeriodTotal(team: 'home' | 'away', points:number) {
		if (team == 'away') {
			if (this.currentGame!.period == 1) {
				this.currentGame!.awayPointsQ1 += points;
			} else if (this.currentGame!.period == 2) {
				this.currentGame!.awayPointsQ2 += points;
			} else if (this.currentGame!.period == 3) {
				this.currentGame!.awayPointsQ3 += points;
			} else if (this.currentGame!.period == 4) {
				this.currentGame!.awayPointsQ4 += points;
			} else {
				this.currentGame!.awayPointsOT += points;
			}
			this.currentGame!.awayFinal += points;
			await this.updateGame();
		} else {
			if (this.currentGame!.period == 1) {
				this.currentGame!.homePointsQ1 += points;
			} else if (this.currentGame!.period == 2) {
				this.currentGame!.homePointsQ2 += points;
			} else if (this.currentGame!.period == 3) {
				this.currentGame!.homePointsQ3 += points;
			} else if (this.currentGame!.period == 4) {
				this.currentGame!.homePointsQ4 += points;
			} else {
				this.currentGame!.homePointsOT += points;
			}
			this.currentGame!.homeFinal += points;
			await this.updateGame();
		}
	}

	private async addPlay(team: 'home' | 'away', action: GameActions, player?: Player) {
		let play: Play = {
			playId: this.plays!.length + 1,
			gameId: this.gameId!,
			turboStatsData: null,
			syncState: SyncState.Added,
			period: this.currentGame!.period,
			playerName: player ? `${player.firstName} ${player.lastName}` : null,
			playerNumber: player ? player.number : null,
			score: `${this.currentGame!.homeFinal} - ${this.currentGame!.awayFinal}`,
			teamName: team == 'home' ? this.currentGame!.homeTeam : this.currentGame!.awayTeam,
			timeStamp: new Date().toJSON(),
			action: action,
			gameClock: this.currentGame!.clock
		}
		this.plays?.unshift(play);
		await this.crud.save(this.db, 'Plays', play);
	}

  async addPoints(team: 'home' | 'away', points: number, missed: boolean = false) {
		if (team == 'away') {
			if (this.awayPlayerSelected != -1) {
				let stat = await this.getStat(this.awayPlayersOnCourt[this.awayPlayerSelected].playerId);
				if (points == 1) {
					stat.freeThrowsAttempted++;
					if (!missed) {
						stat.freeThrowsMade++;
						await this.updatePeriodTotal(team, 1);
						await this.addPlay(team, GameActions.FreeThrowMade, this.awayPlayersOnCourt[this.awayPlayerSelected]);
					} else {
						await this.addPlay(team, GameActions.FreeThrowMissed, this.awayPlayersOnCourt[this.awayPlayerSelected]);
					}
				} else if (points == 2) {
					stat.fieldGoalsAttempted++;
					if (!missed) {
						stat.fieldGoalsMade++;
						await this.updatePeriodTotal(team, 2);
						await this.addPlay(team, GameActions.ShotMade, this.awayPlayersOnCourt[this.awayPlayerSelected]);
						this.assistDisplay = true;
					} else {
						await this.addPlay(team, GameActions.ShotMissed, this.awayPlayersOnCourt[this.awayPlayerSelected]);
						this.reboundDisplay = true;
					}
				} else {
					stat.fieldGoalsAttempted++;
					stat.threesAttempted++;
					if (!missed) {
						stat.fieldGoalsMade++;
						stat.threesMade++;
						await this.updatePeriodTotal(team, 3);
						await this.addPlay(team, GameActions.ThreeMade, this.awayPlayersOnCourt[this.awayPlayerSelected]);
						this.assistDisplay = true;
					} else {
						await this.addPlay(team, GameActions.ThreeMissed, this.awayPlayersOnCourt[this.awayPlayerSelected]);
						this.reboundDisplay = true;
					}
				}
				await this.saveStat(stat);
			}
		} else {
			if (this.homePlayerSelected != -1) {
				let stat = await this.getStat(this.homePlayersOnCourt[this.homePlayerSelected].playerId);
				if (points == 1) {
					stat.freeThrowsAttempted++;
					if (!missed) {
						stat.freeThrowsMade++;
						await this.updatePeriodTotal(team, 1);
						await this.addPlay(team, GameActions.FreeThrowMade, this.homePlayersOnCourt[this.homePlayerSelected]);
					} else {
						await this.addPlay(team, GameActions.FreeThrowMissed, this.homePlayersOnCourt[this.homePlayerSelected]);
					}
				} else if (points == 2) {
					stat.fieldGoalsAttempted++;
					if (!missed) {
						stat.fieldGoalsMade++;
						await this.updatePeriodTotal(team, 2);
						await this.addPlay(team, GameActions.ShotMade, this.homePlayersOnCourt[this.homePlayerSelected]);
						this.assistDisplay = true;
					} else {
						await this.addPlay(team, GameActions.ShotMissed, this.homePlayersOnCourt[this.homePlayerSelected]);
						this.reboundDisplay = true;
					}
				} else {
					stat.fieldGoalsAttempted++;
					stat.threesAttempted++;
					if (!missed) {
						stat.fieldGoalsMade++;
						stat.threesMade++;
						await this.updatePeriodTotal(team, 3);
						await this.addPlay(team, GameActions.ThreeMade, this.homePlayersOnCourt[this.homePlayerSelected]);
						this.assistDisplay = true;
					} else {
						await this.addPlay(team, GameActions.ThreeMissed, this.homePlayersOnCourt[this.homePlayerSelected]);
						this.reboundDisplay = true;
					}
				}
				await this.saveStat(stat);
			}
		}
  }

  async addFoul(team: 'home' | 'away') {
		if (team == 'away') {
			if (this.awayPlayerSelected != -1) {
				this.stopTimer();
				let player = this.awayPlayersOnCourt[this.awayPlayerSelected];
				let stat = await this.getStat(player.playerId);
				stat.fouls++;
				await this.saveStat(stat);
				if (this.currentGame!.awayCurrentFouls == null) {
					this.currentGame!.awayCurrentFouls = 1;
				} else {
					this.currentGame!.awayCurrentFouls++;
				}
				this.updateGame();
				this.addPlay(team, GameActions.Foul, player);
			}
		} else {
			if (this.homePlayerSelected != -1) {
				this.stopTimer();
				let player = this.homePlayersOnCourt[this.homePlayerSelected];
				let stat = await this.getStat(player.playerId);
				stat.fouls++;
				await this.saveStat(stat);
				if (this.currentGame!.awayCurrentFouls == null) {
					this.currentGame!.awayCurrentFouls = 1;
				} else {
					this.currentGame!.awayCurrentFouls++;
				}
				this.updateGame();
				this.addPlay(team, GameActions.Foul, player);
			}
		}
  }

  addTimeout(team: 'home' | 'away', partial: boolean) {
		this.stopTimer();
		if (team == 'away') {
			if (this.currentGame!.awayTeamTOL > 0) {
				this.currentGame!.awayTeamTOL--;
			}
			if (partial && this.currentGame!.awayPartialTOL != null && this.currentGame!.awayPartialTOL > 0) {
				this.currentGame!.awayPartialTOL--;
			} else if (!partial && this.currentGame!.awayFullTOL != null && this.currentGame!.awayFullTOL > 0) {
				this.currentGame!.awayFullTOL--;
			}
			this.updateGame();
		} else {
			if (this.currentGame!.homeTeamTOL > 0) {
				this.currentGame!.homeTeamTOL--;
			}
			if (partial && this.currentGame!.homePartialTOL != null && this.currentGame!.homePartialTOL > 0) {
				this.currentGame!.homePartialTOL--;
			} else if (!partial && this.currentGame!.homeFullTOL != null && this.currentGame!.homeFullTOL > 0) {
				this.currentGame!.homeFullTOL--;
			}
			this.updateGame();
		}
  }

	async addSteal(team: 'home' | 'away') {
		if (team == 'away') {
			if (this.awayPlayerSelected != -1) {
				let player = this.awayPlayersOnCourt[this.awayPlayerSelected];
				let stat = await this.getStat(player.playerId);
				stat.steals++;
				await this.saveStat(stat);
				this.addPlay(team, GameActions.Steal, player);
			}
		} else {
			if (this.homePlayerSelected != -1) {
				let player = this.homePlayersOnCourt[this.homePlayerSelected];
				let stat = await this.getStat(player.playerId);
				stat.steals++;
				await this.saveStat(stat);
				this.addPlay(team, GameActions.Steal, player);
			}
		}
		this.stealDisplay = true;
	}

	async addAssist(team: 'home' | 'away') {
		if (team == 'away') {
			if (this.awayPlayerSelected != -1) {
				let player = this.awayPlayersOnCourt[this.awayPlayerSelected];
				let stat = await this.getStat(player.playerId);
				stat.assists++;
				await this.saveStat(stat);
				this.addPlay(team, GameActions.Assist, player);
			}
		} else {
			if (this.homePlayerSelected != -1) {
				let player = this.homePlayersOnCourt[this.homePlayerSelected];
				let stat = await this.getStat(player.playerId);
				stat.assists++;
				await this.saveStat(stat);
				this.addPlay(team, GameActions.Assist, player);
			}
		}
	}

	addPassback(team: 'home' | 'away', made: boolean) {

	}

	async addRebound(team: 'home' | 'away', offensive: boolean) {
		if (team == 'away') {
			if (this.awayPlayerSelected != -1) {
				let player = this.awayPlayersOnCourt[this.awayPlayerSelected];
				let stat = await this.getStat(player?.playerId);
				stat.rebounds++;
				if (offensive) {
					stat.offensiveRebounds++;
					await this.addPlay(team, GameActions.OffRebound, player);
				} else {
					stat.defensiveRebounds++;
					await this.addPlay(team, GameActions.DefRebound, player);
				}
				await this.saveStat(stat);
			}
		} else {
			if (this.homePlayerSelected != -1) {
				let player = this.homePlayersOnCourt[this.homePlayerSelected];
				let stat = await this.getStat(player?.playerId);
				stat.rebounds++;
				if (offensive) {
					stat.offensiveRebounds++;
					await this.addPlay(team, GameActions.OffRebound, player);
				} else {
					stat.defensiveRebounds++;
					await this.addPlay(team, GameActions.DefRebound, player);
				}
				await this.saveStat(stat);
			}
		}
	}

	async addBlock(team: 'home' | 'away') {
		if (team == 'away') {
			if (this.awayPlayerSelected != -1) {
				let player = this.awayPlayersOnCourt[this.awayPlayerSelected];
				let stat = await this.getStat(player.playerId);
				stat.blocks++;
				await this.saveStat(stat);
				this.addPlay(team, GameActions.Block, player);
			}
		} else {
			if (this.homePlayerSelected != -1) {
				let player = this.homePlayersOnCourt[this.homePlayerSelected];
				let stat = await this.getStat(player.playerId);
				stat.blocks++;
				await this.saveStat(stat);
				this.addPlay(team, GameActions.Block, player);
			}
		}
	}

	async addTurnover(team: 'home' | 'away') {
		if (team == 'away') {
			if (this.awayPlayerSelected != -1) {
				let player = this.awayPlayersOnCourt[this.awayPlayerSelected];
				let stat = await this.getStat(player.playerId);
				stat.turnovers++;
				await this.saveStat(stat);
				this.addPlay(team, GameActions.Turnover, player);
			}
		} else {
			if (this.homePlayerSelected != -1) {
				let player = this.homePlayersOnCourt[this.homePlayerSelected];
				let stat = await this.getStat(player.playerId);
				stat.turnovers++;
				await this.saveStat(stat);
				this.addPlay(team, GameActions.Turnover, player);
			}
		}
	}

	public async updateGame(state: SyncState = SyncState.Modified) {
		if (this.currentGame!.syncState != SyncState.Added) {
			this.currentGame!.syncState = state;
		}
		await this.crud.save(this.db, 'Games', this.currentGame!, { "gameId": `'${this.gameId}'` });
	}

	public async updateGameCastSetting() {
	  await this.crud.save(this.db, 'GameCastSettings', this.gameCastSettings!, { "game": `'${this.gameId}'` });
	}

	public async updatePlay(play: Play) {
		play.syncState = SyncState.Modified;
		await this.crud.save(this.db, 'Plays', play, { "playId": `${play.playId}`,"gameId": `'${this.gameId}'` });
	}

	public getPlayer(play:Play) {
		if (play.teamName == this.currentGame!.homeTeam) {
			return this.homeTeamPlayers!.find(t => t.number == play.playerNumber && `${t.firstName} ${t.lastName}` == play.playerName);
		} else {
			return this.awayTeamPlayers!.find(t => t.number == play.playerNumber && `${t.firstName} ${t.lastName}` == play.playerName);
		}
	}

	startStopTimer() {
    if (this.timerRunning) {
      this.stopTimer();
    } else {
      this.startTimer();
    }
  }

  startTimer() {
    this.timerRunning = true;
    this.timerSubscription = interval(1000).subscribe(() => {
      if (this.timeLeft > 0) {
        this.timeLeft--;
        this.updateTimerDisplay();
      } else {
        this.stopTimer();
      }
    });
  }

  stopTimer() {
    this.timerRunning = false;
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
  }

  updateTimerDisplay() {
    const minutes = Math.floor(this.timeLeft / 60);
    const seconds = this.timeLeft % 60;
    this.currentGame!.clock = `${minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
  }

  ngOnDestroy() {
    this.stopTimer();
  }

}

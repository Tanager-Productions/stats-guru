import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, Subscription, interval, map } from 'rxjs';
import { Game } from 'src/app/interfaces/game.interface';
import { Player } from 'src/app/interfaces/player.interface';
import { CrudService } from 'src/app/services/crud/crud.service';
import { SqlService } from 'src/app/services/sql/sql.service';
import { SyncState } from 'src/app/interfaces/syncState.enum';
import { Stat } from 'src/app/interfaces/stat.interface';
import { Play } from 'src/app/interfaces/play.interface';
import { SQLiteDBConnection } from '@capacitor-community/sqlite';
import { ColDef, GridApi, SelectionChangedEvent } from 'ag-grid-community';
import { GameCastSettings } from 'src/app/interfaces/gameCastSetting.interface';

//teamName | player name | player number | GameAction | period | gameClock | score | timestamp

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

@Component({
  selector: 'app-gamecast',
  templateUrl: './gamecast.component.html',
  styleUrls: ['./gamecast.component.scss'],
})
export class GamecastComponent {
	db!:SQLiteDBConnection;
	ro:boolean = true;
  gameId: number | undefined;
  currentGame?: Game;
	homeTeamPlayers?: Player[];
	awayTeamPlayers?: Player[];
	homeTeamStats?: any[];
	awayTeamStats?: any[];
	homePlayersOnCourt: Player[] = [];
	awayPlayersOnCourt: Player[] = [];
	stats?: Stat[];
	selectedStat: Stat | undefined;
	plays?: Play[];
	homeTeamFouls: number = 0;
	awayTeamFouls:number = 0;
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
	statGridApi!: GridApi<Stat>;

	//gameActionskey = Object.keys(GameActions);
	public teamStats: ColDef[] = [
		{field: 'number', headerName: 'NUM', pinned: true},
		{field: 'firstName', headerName: 'First Name'},
		{field: 'lastName', headerName: 'Last Name'},
		{field: 'minutes', headerName: 'MIN', width: 80, editable: true},
		{field: 'rebounds', headerName: 'REB', width: 80, editable: true},
		{field: 'defensiveRebounds', headerName: 'DREB', width: 90, editable: true},
		{field: 'offensiveRebounds', headerName: 'OREB', width: 90, editable: true},
		{field: 'fieldGoalsMade', headerName: 'FGM', width: 90, editable: true},
		{field: 'fieldGoalsAttempted', headerName: 'FGA', width: 80, editable: true},
		{field: 'blocks', headerName: 'BLK', width: 80, editable: true},
		{field: 'steals', headerName: 'STL', width: 80, editable: true},
		{field: 'threesMade', headerName: '3FGM', width: 90, editable: true},
		{field: 'threesAttempted', headerName: '3FGA', width: 90, editable: true},
		{field: 'freethrowsMade', headerName: 'FTM', width: 80, editable: true},
		{field: 'freethrowsAttempted', headerName: 'FTA', width: 80, editable: true},
		{field: 'points', headerName: 'PTS', width: 80, editable: true},
		{field: 'turnovers', headerName: 'TO', width: 80, editable: true},
		{field: 'fouls', headerName: 'FOUL', width: 90, editable: true},
		{field: 'technicalFouls', headerName: 'TECH', width: 90, editable: true},
		{field: 'plusOrMinus', headerName: '+/-', width: 80, editable: true},
	];

  constructor(
		private route: ActivatedRoute,
		private crud: CrudService,
		private sql: SqlService) {}

  ngOnInit() {
    this.route.params.subscribe((params: { [x: string]: string | number }) => {
      this.gameId = params['gameId'] as number;
			this.fetchData();
    });
  }

	onCellValueChanged(event: any) {
    console.log(event);
    event.data.modified = true;
  }

	setStat($event: SelectionChangedEvent<Stat>) {
		if ($event) this.selectedStat = $event.api.getSelectedRows()[0];
	}

	public isRowSelected() {
    if (this.statGridApi)
      return this.statGridApi.getSelectedRows().length > 0;
    else
      return false;
  }

	private async fetchData() {
		this.db = await this.sql.createConnection();
		let res = await this.crud.rawQuery(this.db, `SELECT * FROM GameCastSettings WHERE game = ${this.gameId}`);
		if (res.length == 0) {
			let gameCastSetting: GameCastSettings = {
				id: 0,
				partialTimeouts: 0,
				fullTimeouts: 2,
				periodsPerGame: 2,
				minutesPerPeriod: 18,
				minutesPerOvertime: 10,
				game: this.gameId!,
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
			this.gameCastSettings = (await this.crud.rawQuery(this.db, `SELECT * FROM GameCastSettings WHERE game = ${this.gameId}`))[0];
		} else {
			this.gameCastSettings = res[0];
		}
		this.currentGame = (await this.crud.rawQuery(this.db, `
			SELECT 	*
			FROM 		Games
			WHERE 	gameId = ${this.gameId}
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
			WHERE 	game = ${this.gameId};
		`);
		this.plays = await this.crud.rawQuery(this.db, `
			SELECT 		*
			FROM 			Plays
			WHERE 		gameId = ${this.gameId}
			ORDER BY	playId DESC
		`);
		await this.loadBoxScore();
	}

	gameActionsProtocolKeys() : Array<string> {
		var keys = Object.keys(this.gameActions);
		return keys.slice(keys.length / 2);
	}

	async loadBoxScore() {
		this.homeTeamStats = await this.crud.rawQuery(this.db, `
			SELECT			Players.number, Players.firstName, Players.lastName, Stats.minutes, Stats.rebounds, Stats.defensiveRebounds,
									Stats.offensiveRebounds, Stats.fieldGoalsMade, Stats.fieldGoalsAttempted, Stats.blocks, Stats.steals, Stats.threesMade,
									Stats.threesAttempted, Stats.freethrowsMade, Stats.freethrowsAttempted, Stats.points, Stats.turnovers,
									Stats.fouls, Stats.technicalFouls, Stats.plusOrMinus
			FROM				Stats
			JOIN				Players ON Stats.player = Players.playerId
			WHERE 			Players.team = '${this.currentGame?.homeTeam}'
			AND					Stats.game = ${this.gameId}
			ORDER BY 		Players.number;
		`);
		this.awayTeamStats = await this.crud.rawQuery(this.db, `
			SELECT		Players.number, Players.firstName, Players.lastName, Stats.minutes, Stats.rebounds, Stats.defensiveRebounds,
								Stats.offensiveRebounds, Stats.fieldGoalsMade, Stats.fieldGoalsAttempted, Stats.blocks, Stats.steals, Stats.threesMade,
								Stats.threesAttempted, Stats.freethrowsMade, Stats.freethrowsAttempted, Stats.points, Stats.turnovers,
								Stats.fouls, Stats.technicalFouls, Stats.plusOrMinus
			FROM			Stats
			JOIN			Players ON Stats.player = Players.playerId
			WHERE 		Players.team = '${this.currentGame?.awayTeam}'
			AND				Stats.game = ${this.gameId}
			ORDER BY 	Players.number;
		`);
	}

	async savePlayer(player: Player) {
		player.syncState = SyncState.Modified;
		await this.crud.save(this.db, "Players", player, {"playerId": `${player.playerId}`});
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
      playerId: 0,
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
			if(this.homePlayersOnCourt.length < 5) {
				this.homePlayersOnCourt.push(player);
			}
		} else {
			if (this.awayPlayersOnCourt.length < 5) {
				this.awayPlayersOnCourt.push(player);
			}
		}
	}

	selectPlayer(team: 'home' | 'away', index: number) {
		if (team == 'away') {
			if (this.awayPlayerSelected == index) {
				this.awayPlayerSelected = -1;
			} else {
				this.awayPlayerSelected = index;
			}
		} else {
			if (this.homePlayerSelected == index) {
				this.homePlayerSelected = -1;
			} else {
				this.homePlayerSelected = index;
			}
		}
	}

  removeFromCourt (team: 'home' | 'away', player: Player, index:number) {
		if (team == 'away') {
			if (this.awayPlayerSelected == index) {
				this.awayPlayerSelected = -1;
			}
			this.awayPlayersOnCourt.splice(this.awayPlayersOnCourt.indexOf(player), 1);
		} else {
			if (this.homePlayerSelected == index) {
				this.homePlayerSelected = -1;
			}
			this.homePlayersOnCourt.splice(this.homePlayersOnCourt.indexOf(player), 1);
		}
  }

	private async getStat(playerId:number) {
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
				WHERE 	game = ${this.gameId};
			`);
			return this.stats!.find(t => t.player == playerId)!;
		} else {
			return stat;
		}
	}

	private async saveStat(stat:Stat) {
		await this.crud.save(this.db, "Stats", stat, {"player": `${stat.player}`, "game": `${this.gameId}`});
		stat = (await this.crud.rawQuery(this.db, `select * from Stats where player = ${stat.player} and game = ${stat.game}`))[0];
	}

	private async updatePeriodTotal(team: 'home' | 'away', points:number) {
		if (team == 'away') {
			if (this.currentGame!.period == '1') {
				this.currentGame!.awayPointsQ1 += points;
			} else if (this.currentGame!.period == '2') {
				this.currentGame!.awayPointsQ2 += points;
			} else if (this.currentGame!.period == '3') {
				this.currentGame!.awayPointsQ3 += points;
			} else if (this.currentGame!.period == '4') {
				this.currentGame!.awayPointsQ4 += points;
			} else {
				this.currentGame!.awayPointsOT += points;
			}
			this.currentGame!.homeFinal += points;
			await this.updateGame();
		} else {
			if (this.currentGame!.period == '1') {
				this.currentGame!.homePointsQ1 += points;
			} else if (this.currentGame!.period == '2') {
				this.currentGame!.homePointsQ2 += points;
			} else if (this.currentGame!.period == '3') {
				this.currentGame!.homePointsQ3 += points;
			} else if (this.currentGame!.period == '4') {
				this.currentGame!.homePointsQ4 += points;
			} else {
				this.currentGame!.homePointsOT += points;
			}
			this.currentGame!.awayFinal += points;
			await this.updateGame();
		}
	}

	private async addPlay(team: 'home' | 'away', action:GameActions, player?:Player) {
		let play: Play = {
			playId: this.plays!.length + 1,
			gameId: this.gameId!,
			turboStatsData: null,
			syncState: SyncState.Added,
			period: null,
			playerName: null,
			playerNumber: null,
			score: null,
			teamName: null,
			timeStamp: null,
			action: GameActions.Assist,
			gameClock: null
		}
		await this.crud.save(this.db, 'Plays', play);
		this.plays?.unshift(play);
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
					} else {
						await this.addPlay(team, GameActions.ShotMissed, this.awayPlayersOnCourt[this.awayPlayerSelected]);
					}
				} else {
					stat.fieldGoalsAttempted++;
					stat.threesAttempted++;
					if (!missed) {
						stat.fieldGoalsMade++;
						stat.threesMade++;
						await this.updatePeriodTotal(team, 3);
						await this.addPlay(team, GameActions.ThreeMade, this.awayPlayersOnCourt[this.awayPlayerSelected]);
					} else {
						await this.addPlay(team, GameActions.ThreeMissed, this.awayPlayersOnCourt[this.awayPlayerSelected]);
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
					} else {
						await this.addPlay(team, GameActions.ShotMissed, this.homePlayersOnCourt[this.homePlayerSelected]);
					}
				} else {
					stat.fieldGoalsAttempted++;
					stat.threesAttempted++;
					if (!missed) {
						stat.fieldGoalsMade++;
						stat.threesMade++;
						await this.updatePeriodTotal(team, 3);
						await this.addPlay(team, GameActions.ThreeMade, this.homePlayersOnCourt[this.homePlayerSelected]);
					} else {
						await this.addPlay(team, GameActions.ThreeMissed, this.homePlayersOnCourt[this.homePlayerSelected]);
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
				let stat = await this.getStat(player.playerId);
				stat.rebounds++;
				if (offensive) {
					stat.offensiveRebounds++;
					this.addPlay(team, GameActions.OffRebound, player);
				} else {
					stat.defensiveRebounds++;
					this.addPlay(team, GameActions.DefRebound, player);
				}
				await this.saveStat(stat);
			}
		} else {
			if (this.homePlayerSelected != -1) {
				let player = this.homePlayersOnCourt[this.homePlayerSelected];
				let stat = await this.getStat(player.playerId);
				stat.rebounds++;
				if (offensive) {
					stat.offensiveRebounds++;
					this.addPlay(team, GameActions.OffRebound, player);
				} else {
					stat.defensiveRebounds++;
					this.addPlay(team, GameActions.DefRebound, player);
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

	public async updateGame() {
		this.currentGame!.syncState = SyncState.Modified;
		await this.crud.save(this.db, 'Games', this.currentGame!, { "gameId": `${this.gameId}` });
		let game = (await this.crud.rawQuery(this.db, `
			SELECT 	*
			FROM 		Games
			WHERE 	gameId = ${this.gameId}
		`))[0];
		let currentGameCopy:any = this.currentGame;
		for (let key in game) {
			currentGameCopy[key] = game[key];
		}
	}

	public async updateGameCastSetting() {
	  await this.crud.save(this.db, 'GameCastSettings', this.gameCastSettings!, { "game": `${this.gameId}` });
		let game = (await this.crud.rawQuery(this.db, `
			SELECT 	*
			FROM 		GameCastSettings
			WHERE 	game = ${this.gameId}
		`))[0];
		let currentGameCastSettingsCopy:any = this.gameCastSettings;
		for (let key in game) {
			currentGameCastSettingsCopy[key] = game[key];
		}
	}

	public async updatePlay(play: Play) {
		let selectedActionString = play.action.toString() as keyof typeof GameActions;
		let selectedAction = GameActions[selectedActionString];
		play!.action = selectedAction;
		play!.syncState = SyncState.Modified;
	  await this.crud.save(this.db, 'Plays', play!, { "playId": `${play.playId}`,"gameId": `${this.gameId}` });
		let plays = (await this.crud.rawQuery(this.db, `
			SELECT 	*
			FROM 		Plays
			WHERE 	gameId = ${this.gameId} and playId = ${play.playId}
		`))[0];
		let currentPlayCopy:any = play;
		for (let key in plays) {
			currentPlayCopy[key] = plays[key];
		}
	}

	public async editHomeGame() {
		this.currentGame!.syncState = SyncState.Modified;
		let game:any = this.currentGame;
		delete game.homeCurrentFouls;
		delete game.homePartialTOL;
		delete game.homeFullTOL;
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

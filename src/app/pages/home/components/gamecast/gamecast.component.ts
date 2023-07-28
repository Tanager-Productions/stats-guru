import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription, interval } from 'rxjs';
import { Game } from 'src/app/interfaces/game.interface';
import { Player } from 'src/app/interfaces/player.interface';
import { CrudService } from 'src/app/services/crud/crud.service';
import { SqlService } from 'src/app/services/sql/sql.service';
import { SyncState } from 'src/app/interfaces/syncState.enum';
import { Stat } from 'src/app/interfaces/stat.interface';
import { Play } from 'src/app/interfaces/play.interface';
import { ColDef, GridApi } from 'ag-grid-community';
import { GameCastSettings } from 'src/app/interfaces/gameCastSetting.interface';
import { ApiService } from 'src/app/services/api/api.service';
import { GamecastDto } from 'src/app/interfaces/gamecastDto.interface';
import { currentDatabaseVersion } from 'src/app/upgrades/versions';
import { SyncMode } from 'src/app/interfaces/sync.interface';
import { SyncResult } from 'src/app/interfaces/syncResult.interface';
import { SyncService } from 'src/app/services/sync/sync.service';

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
	PartialTO = 75,
	Passback = 80,
	FailedPassback = 85
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
  gameId!: string;
  currentGame?: Game;
	homeTeamPlayers?: Player[];
	awayTeamPlayers?: Player[];
	homeTeamStats!: StatsRow[];
	awayTeamStats!: StatsRow[];
	homePlayersOnCourt: Player[] = [];
	awayPlayersOnCourt: Player[] = [];
	hiddenPlayerIds: string[] = [];
	stats?: Stat[];
	plays?: Play[];
	prevPlays?: Play[];
	homeTeamFouls: number = 0;
	awayTeamFouls: number = 0;
  timerSubscription?: Subscription;
  timerDuration!: number;
  timerRunning: boolean = false;
	newPlayerNumber: string = '';
	homePlayerSelected: number = -1;
	awayPlayerSelected: number = -1;
	editPlayer: boolean = false;
	statsTab: 'home' | 'away' = 'home';
	gameCastSettings?: GameCastSettings;
	initSub?:Subscription;
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
	showPeriodTotal: boolean = false;
	editHomePeriod: boolean = true;

	//Displaying Auto-Complete Options:
	reboundDisplay: boolean = false;
	stealDisplay: boolean = false;
	assistDisplay: boolean = false;
	foulDisplay: boolean = false;
	missedDisplay: boolean = false;

	//plusOrMinus
	homeTeamPlusOrMinus = 0;
	awayTeamPlusOrMinus = 0;

	//gamecast
	interval: any;

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
		private sync: SyncService) {}

  ngOnInit() {
		this.initSub = this.sql.isReady().subscribe(ready => {
			if (ready) {
				this.sync.gameCastInProgress = true;
				this.route.params.subscribe((params: { [x: string]: string }) => {
					this.gameId = params['gameId'];
					this.fetchData();
					if (this.sync.online) {
						this.interval = setInterval(() => this.send(), 15000);
					}
				});
			}
		});
  }

	private async send() {
		let players = this.homeTeamPlayers!.slice();
		players.push(...this.awayTeamPlayers!);
		let dto: GamecastDto = {
			game: this.currentGame!,
			version: currentDatabaseVersion,
			overwrite: null,
			mode: SyncMode.Full,
			stats: this.stats!,
			players: players,
			plays: this.plays!
		}
		let response = await this.api.GameCast(dto);
		let result:SyncResult = response.data;
		console.log(result);
		if (result.errorMessages.length > 0) {
			console.error("GameCast had errors!", result.errorMessages);
		}
	}

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

	async setPrevPlays() {
		this.prevPlays = await this.crud.rawQuery(`
			SELECT 		*
			FROM 			Plays
			WHERE 		gameId = '${this.gameId}'
			AND				syncState != 3
			ORDER BY	playId DESC
		`);
	}

	async addPlayer(player:Player) {
		if (this.addHomePlayer) {
			this.homeTeamPlayers!.push(player);
			this.homeTeamPlayers?.sort((a, b) => {
				if (a.number == b.number)
					return 0;
				else if (a.number < b.number)
					return -1;
				else
					return 1;
			});
		} else {
			this.awayTeamPlayers!.push(player);
			this.awayTeamPlayers?.sort((a, b) => {
				if (a.number == b.number)
					return 0;
				else if (a.number < b.number)
					return -1;
				else
					return 1;
			});
		}
		await this.crud.save('players', player);
	}

	private async fetchData() {
		let res = await this.crud.rawQuery(`SELECT * FROM GameCastSettings WHERE game = '${this.gameId}'`);
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
				resetTimeoutsEveryPeriod: 1,
				homePartialTOL: 0,
				awayPartialTOL: 0,
				homeFullTOL: 2,
				awayFullTOL: 2,
				homeCurrentFouls: 0,
				awayCurrentFouls: 0,
				hiddenPlayers: null,
				homeHasPossession: 1
			}
			await this.crud.save('gameCastSettings', gameCastSetting);
			this.gameCastSettings = (await this.crud.rawQuery(`SELECT * FROM GameCastSettings WHERE game = '${this.gameId}'`))[0];
		} else {
			this.gameCastSettings = res[0];
		}
		this.currentGame = (await this.crud.rawQuery(`
			SELECT 	*
			FROM 		Games
			WHERE 	gameId = '${this.gameId}'
		`))[0];
    this.homeTeamPlayers = await this.crud.rawQuery(`
			SELECT 		*
			FROM 			Players
			WHERE 		team = '${this.currentGame?.homeTeam}'
			AND 			isMale = ${this.currentGame?.isMale}
			ORDER BY 	number ASC;
		`);
		if (this.homeTeamPlayers.find(t => t.firstName == 'team' && t.lastName == 'team') == undefined) {
			this.addHomePlayer = true;
			await this.addPlayer({
				playerId: crypto.randomUUID(),
				picture: null,
				firstName: 'team',
				lastName: 'team',
				isMale: this.currentGame!.isMale,
				team: this.currentGame!.homeTeam,
				socialMediaString: null,
				weight: null,
				age: null,
				number: -1,
				position: 'F',
				height: null,
				homeState: null,
				homeTown: null,
				syncState: SyncState.Unchanged
			});
		}
    this.awayTeamPlayers = await this.crud.rawQuery(`
			SELECT 		*
			FROM 			Players
			WHERE 		team = '${this.currentGame?.awayTeam}'
			AND 			isMale = ${this.currentGame?.isMale}
			ORDER BY 	number ASC;
		`);
		if (this.awayTeamPlayers.find(t => t.firstName == 'team' && t.lastName == 'team') == undefined) {
			this.addHomePlayer = false;
			await this.addPlayer({
				playerId: crypto.randomUUID(),
				picture: null,
				firstName: 'team',
				lastName: 'team',
				isMale: this.currentGame!.isMale,
				team: this.currentGame!.awayTeam,
				socialMediaString: null,
				weight: null,
				age: null,
				number: -1,
				position: 'F',
				height: null,
				homeState: null,
				homeTown: null,
				syncState: SyncState.Unchanged
			});
		}
		this.stats = await this.crud.rawQuery(`
			SELECT	*
			FROM 		Stats
			WHERE 	game = '${this.gameId}';
		`);
		this.plays = await this.crud.rawQuery(`
			SELECT 		*
			FROM 			Plays
			WHERE 		gameId = '${this.gameId}'
			AND				syncState != 3
			ORDER BY	playId DESC
		`);
		if (this.gameCastSettings!.hiddenPlayers != null && this.gameCastSettings!.hiddenPlayers != "") {
			this.hiddenPlayerIds = this.gameCastSettings!.hiddenPlayers.split(',');
		}
		if (this.gameCastSettings!.homePlayersOnCourt != null) {
			this.homePlayersOnCourt = this.homeTeamPlayers?.filter(t => this.gameCastSettings!.homePlayersOnCourt!.split(',').includes(t.playerId.toString()))!;
			if (this.homePlayersOnCourt.find(t => t.firstName == 'team' && t.lastName == 'team') == undefined) {
				this.homePlayersOnCourt.push(this.homeTeamPlayers.find(t => t.firstName == 'team' && t.lastName == 'team')!);
				this.gameCastSettings!.homePlayersOnCourt = this.homePlayersOnCourt.toString();
				await this.updateGameCastSetting();
			}
		} else {
			this.homePlayersOnCourt.push(this.homeTeamPlayers.find(t => t.firstName == 'team' && t.lastName == 'team')!);
			this.gameCastSettings!.homePlayersOnCourt = this.homePlayersOnCourt.toString();
			await this.updateGameCastSetting();
		}
		if (this.gameCastSettings!.awayPlayersOnCourt != null) {
			this.awayPlayersOnCourt = this.awayTeamPlayers?.filter(t => this.gameCastSettings!.awayPlayersOnCourt!.split(',').includes(t.playerId.toString()))!;
			if (this.awayPlayersOnCourt.find(t => t.firstName == 'team' && t.lastName == 'team') == undefined) {
				this.awayPlayersOnCourt.push(this.awayTeamPlayers.find(t => t.firstName == 'team' && t.lastName == 'team')!);
				this.gameCastSettings!.awayPlayersOnCourt = this.awayPlayersOnCourt.toString();
				await this.updateGameCastSetting();
			}
		} else {
			this.awayPlayersOnCourt.push(this.awayTeamPlayers.find(t => t.firstName == 'team' && t.lastName == 'team')!);
			this.gameCastSettings!.awayPlayersOnCourt = this.awayPlayersOnCourt.toString();
			await this.updateGameCastSetting();
		}
	}

	async hidePlayer($event:Player) {
		this.hiddenPlayerIds.push($event.playerId);
		this.gameCastSettings!.hiddenPlayers = this.hiddenPlayerIds.toString();
		await this.updateGameCastSetting();
	}

	async unhidePlayer($event:Player) {
		let index = this.hiddenPlayerIds.findIndex(t => t == $event.playerId);
		this.hiddenPlayerIds.splice(index, 1);
		this.gameCastSettings!.hiddenPlayers = this.hiddenPlayerIds.toString();
		await this.updateGameCastSetting();
	}

	async switchPossession() {
		if (this.gameCastSettings!.homeHasPossession == 1) {
			this.gameCastSettings!.homeHasPossession = 0;
		} else {
			this.gameCastSettings!.homeHasPossession = 1;
		}
		await this.updateGameCastSetting();
	}

	async loadBoxScore() {
		this.homeTeamStats = await this.crud.rawQuery(`
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
		this.awayTeamStats = await this.crud.rawQuery(`
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
		if (!this.sync.online) {
			player.syncState = SyncState.Modified;
		}
		await this.crud.save("players", player, {"playerId": `'${player.playerId}'`});
		if (player.team == this.currentGame!.homeTeam) {
			this.homeTeamPlayers?.sort((a, b) => {
				if (a.number == b.number)
					return 0;
				else if (a.number < b.number)
					return -1;
				else
					return 1;
			});
		} else {
			this.awayTeamPlayers?.sort((a, b) => {
				if (a.number == b.number)
					return 0;
				else if (a.number < b.number)
					return -1;
				else
					return 1;
			});
		}
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
      syncState: this.sync.online ? SyncState.Unchanged : SyncState.Added,
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

		await this.crud.save("players", newTeamPlayer);
  }

	toggleGameComplete() {
		if(this.currentGame!.complete == 1) {
			this.currentGame!.complete = 0;
			this.updateGame();
		} else {
			this.currentGame!.complete = 1;
			this.updateGame();
		}
	}

	addToCourt(team: 'home' | 'away', player: Player) {
		if (team == 'home') {
			if (this.homePlayersOnCourt.length < 6) {
				this.homePlayersOnCourt.push(player);
				this.gameCastSettings!.homePlayersOnCourt = this.homePlayersOnCourt.map(t => t.playerId).toString();
			}
		} else {
			if (this.awayPlayersOnCourt.length < 6) {
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
		} else if (this.missedDisplay) {
			if (team == 'home') {
				this.addPlay('home', GameActions.ShotMissed, this.homePlayersOnCourt[this.homePlayerSelected]);
				this.missedDisplay = false;
				this.reboundDisplay = true;
			} else if (team == 'away') {
				this.addPlay ('away', GameActions.ShotMissed, this.awayPlayersOnCourt[this.awayPlayerSelected]);
				this.missedDisplay = false;
				this.reboundDisplay = true;
			}
		}
	}

	async addTechnical() {
		if (this.homePlayerSelected == -1) {
			let stat = await this.getStat(this.awayPlayersOnCourt[this.awayPlayerSelected].playerId);
			stat.technicalFouls = stat.technicalFouls == null ? 1 : stat.technicalFouls+1;
			this.saveStat(stat);
		} else {
			let stat = await this.getStat(this.homePlayersOnCourt[this.homePlayerSelected].playerId);
			stat.technicalFouls = stat.technicalFouls == null ? 1 : stat.technicalFouls+1;
			this.saveStat(stat);
		}
		this.foulDisplay = false;
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
				syncState: this.sync.online ? SyncState.Unchanged : SyncState.Added,
				points: 0,
				eff: 0
			}
			await this.crud.save("stats", newStat);
			this.stats = await this.crud.rawQuery(`
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
		if (!this.sync.online) {
			stat.syncState == SyncState.Modified;
		}
		await this.crud.save("stats", stat, {"player": `'${stat.player}'`, "game": `'${this.gameId}'`});
		stat = (await this.crud.rawQuery(`select * from Stats where player = '${stat.player}' and game = '${stat.game}'`))[0];
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
			syncState: this.sync.online ? SyncState.Unchanged : SyncState.Added,
			period: this.currentGame!.period,
			playerName: player ? `${player.firstName} ${player.lastName}` : null,
			playerNumber: player ? player.number : null,
			score: `${this.currentGame!.homeFinal} - ${this.currentGame!.awayFinal}`,
			teamName: team == 'home' ? this.currentGame!.homeTeam : this.currentGame!.awayTeam,
			timeStamp: new Date().toJSON(),
			action: action,
			gameClock: this.currentGame!.clock
		}
		if (this.sync.online) {
			await this.crud.save('plays', play);
		} else {
			let existingPlay = (await this.crud.query('plays', {"playId": `${play.playId}`, "gameId": `'${this.gameId}'`}));
			if (existingPlay.length == 1) {
				play.syncState = SyncState.Modified;
				await this.crud.save('plays', play, {"playId": `${play.playId}`, "gameId": `'${this.gameId}'`});
			} else {
				await this.crud.save('plays', play);
			}
		}
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
				await this.stopTimer();
				let player = this.awayPlayersOnCourt[this.awayPlayerSelected];
				let stat = await this.getStat(player.playerId);
				stat.fouls++;
				await this.saveStat(stat);
				if (this.gameCastSettings!.awayCurrentFouls == null) {
					this.gameCastSettings!.awayCurrentFouls = 1;
				} else {
					this.gameCastSettings!.awayCurrentFouls++;
				}
				await this.updateGameCastSetting();
				this.addPlay(team, GameActions.Foul, player);
			}
		} else {
			if (this.homePlayerSelected != -1) {
				await this.stopTimer();
				let player = this.homePlayersOnCourt[this.homePlayerSelected];
				let stat = await this.getStat(player.playerId);
				stat.fouls++;
				await this.saveStat(stat);
				if (this.gameCastSettings!.homeCurrentFouls == null) {
					this.gameCastSettings!.homeCurrentFouls = 1;
				} else {
					this.gameCastSettings!.homeCurrentFouls++;
				}
				await this.updateGameCastSetting();
				await this.addPlay(team, GameActions.Foul, player);
			}
		}
		this.foulDisplay = true;
  }

  async addTimeout(team: 'home' | 'away', partial: boolean) {
		await this.stopTimer();
		if (team == 'away') {
			if (this.currentGame!.awayTeamTOL > 0) {
				this.currentGame!.awayTeamTOL--;
			}
			if (partial && this.gameCastSettings!.awayPartialTOL != null && this.gameCastSettings!.awayPartialTOL > 0) {
				this.gameCastSettings!.awayPartialTOL--;
			} else if (!partial && this.gameCastSettings!.awayFullTOL != null && this.gameCastSettings!.awayFullTOL > 0) {
				this.gameCastSettings!.awayFullTOL--;
			}
			await this.updateGame();
			await this.updateGameCastSetting();
		} else {
			if (this.currentGame!.homeTeamTOL > 0) {
				this.currentGame!.homeTeamTOL--;
			}
			if (partial && this.gameCastSettings!.homePartialTOL != null && this.gameCastSettings!.homePartialTOL > 0) {
				this.gameCastSettings!.homePartialTOL--;
			} else if (!partial && this.gameCastSettings!.homeFullTOL != null && this.gameCastSettings!.homeFullTOL > 0) {
				this.gameCastSettings!.homeFullTOL--;
			}
			await this.updateGame();
			await this.updateGameCastSetting();
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

	async addPassback(team: 'home' | 'away', made: boolean) {
		await this.addPoints(team, 2, true);
		await this.addRebound(team, true);
		await this.addPoints(team, 2, !made);
		this.reboundDisplay = false;
		this.assistDisplay = false;
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
				this.missedDisplay = true;
			}
		} else {
			if (this.homePlayerSelected != -1) {
				let player = this.homePlayersOnCourt[this.homePlayerSelected];
				let stat = await this.getStat(player.playerId);
				stat.blocks++;
				await this.saveStat(stat);
				this.addPlay(team, GameActions.Block, player);
				this.missedDisplay = true;
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
		if (!this.sync.online) {
			if (this.currentGame!.syncState != SyncState.Added) {
				this.currentGame!.syncState = state;
			}
		}
		await this.crud.save('games', this.currentGame!, { "gameId": `'${this.gameId}'` });
	}

	public async updateGameCastSetting() {
	  await this.crud.save('gameCastSettings', this.gameCastSettings!, { "game": `'${this.gameId}'` });
	}

	public async removeLastPlay() {
		let play = this.plays![0];
		await this.undoAction(play);
		if (this.sync.online) {
			await this.crud.delete('plays', {"playId": `${play.playId}`, "gameId": `'${this.gameId}'`});
			this.plays!.splice(0, 1);
		} else {
			play.syncState = SyncState.Deleted;
			await this.crud.save('plays', play, { "playId": `${play.playId}`,"gameId": `'${this.gameId}'` });
			this.plays = this.plays!.filter(t => t.syncState != SyncState.Deleted);
		}
	}

	public async undoAction(play:Play) {
		if (play.action == GameActions.Assist) {
			let stat = await this.getStat(this.getPlayer(play)!.playerId);
			stat.assists--;
			await this.saveStat(stat);
		} else if (play.action == GameActions.Block) {
			let stat = await this.getStat(this.getPlayer(play)!.playerId);
			stat.blocks--;
			await this.saveStat(stat);
		} else if (play.action == GameActions.DefRebound) {
			let stat = await this.getStat(this.getPlayer(play)!.playerId);
			stat.defensiveRebounds--;
			await this.saveStat(stat);
		} else if (play.action == GameActions.Foul) {
			let player = this.getPlayer(play)!;
			let stat = await this.getStat(player.playerId);
			stat.fouls--;
			await this.saveStat(stat);
			if (player.team == this.currentGame!.homeTeam) {
				this.gameCastSettings!.homeCurrentFouls!--;
				await this.updateGameCastSetting();
			} else {
				this.gameCastSettings!.awayCurrentFouls!--;
				await this.updateGameCastSetting();
			}
		} else if (play.action == GameActions.FreeThrowMade) {
			let player = this.getPlayer(play)!;
			let stat = await this.getStat(player.playerId);
			stat.freeThrowsMade--;
			stat.freeThrowsAttempted--;
			await this.saveStat(stat);
			if (player.team == this.currentGame!.homeTeam) {
				if (play.period == 1) {
					this.currentGame!.homePointsQ1--;
				} else if (play.period == 2) {
					this.currentGame!.homePointsQ2--;
				} else if (play.period == 3 && this.gameCastSettings!.periodsPerGame == 2) {
					this.currentGame!.homePointsOT--;
				} else if (play.period == 3 && this.gameCastSettings!.periodsPerGame == 4) {
					this.currentGame!.homePointsQ3--;
				} else if (play.period == 4) {
					this.currentGame!.homePointsQ4--;
				} else if (play.period == 5) {
					this.currentGame!.homePointsOT--;
				}
				this.currentGame!.homeFinal--;
			} else {
				if (play.period == 1) {
					this.currentGame!.awayPointsQ1--;
				} else if (play.period == 2) {
					this.currentGame!.awayPointsQ2--;
				} else if (play.period == 3 && this.gameCastSettings!.periodsPerGame == 2) {
					this.currentGame!.awayPointsOT--;
				} else if (play.period == 3 && this.gameCastSettings!.periodsPerGame == 4) {
					this.currentGame!.awayPointsQ3--;
				} else if (play.period == 4) {
					this.currentGame!.awayPointsQ4--;
				} else if (play.period == 5) {
					this.currentGame!.awayPointsOT--;
				}
				this.currentGame!.awayFinal--;
			}
			await this.updateGame();
		} else if (play.action == GameActions.FreeThrowMissed) {
			let stat = await this.getStat(this.getPlayer(play)!.playerId);
			stat.freeThrowsAttempted--;
			await this.saveStat(stat);
		} else if (play.action == GameActions.FullTO) {
			if (play.teamName == this.currentGame!.homeTeam) {
				this.currentGame!.homeTeamTOL++;
				this.gameCastSettings!.homeFullTOL!++;
			} else {
				this.currentGame!.awayTeamTOL++;
				this.gameCastSettings!.awayFullTOL!++;
			}
			await this.updateGame();
			await this.updateGameCastSetting();
		} else if (play.action == GameActions.OffRebound) {
			let stat = await this.getStat(this.getPlayer(play)!.playerId);
			stat.offensiveRebounds--;
			await this.saveStat(stat);
		} else if (play.action == GameActions.PartialTO) {
			if (play.teamName == this.currentGame!.homeTeam) {
				this.currentGame!.homeTeamTOL++;
				this.gameCastSettings!.homePartialTOL!++;
			} else {
				this.currentGame!.awayTeamTOL++;
				this.gameCastSettings!.awayPartialTOL!++;
			}
			await this.updateGame();
			await this.updateGameCastSetting();
		} else if (play.action == GameActions.ShotMade) {
			let player = this.getPlayer(play)!;
			let stat = await this.getStat(player.playerId);
			stat.fieldGoalsMade--;
			stat.fieldGoalsAttempted--;
			await this.saveStat(stat);
			if (player.team == this.currentGame!.homeTeam) {
				if (play.period == 1) {
					this.currentGame!.homePointsQ1 -= 2;
				} else if (play.period == 2) {
					this.currentGame!.homePointsQ2 -= 2;
				} else if (play.period == 3 && this.gameCastSettings!.periodsPerGame == 2) {
					this.currentGame!.homePointsOT -= 2;
				} else if (play.period == 3 && this.gameCastSettings!.periodsPerGame == 4) {
					this.currentGame!.homePointsQ3 -= 2;
				} else if (play.period == 4) {
					this.currentGame!.homePointsQ4 -= 2;
				} else if (play.period == 5) {
					this.currentGame!.homePointsOT -= 2;
				}
				this.currentGame!.homeFinal -= 2;
			} else {
				if (play.period == 1) {
					this.currentGame!.awayPointsQ1 -= 2;
				} else if (play.period == 2) {
					this.currentGame!.awayPointsQ2 -= 2;
				} else if (play.period == 3 && this.gameCastSettings!.periodsPerGame == 2) {
					this.currentGame!.awayPointsOT -= 2;
				} else if (play.period == 3 && this.gameCastSettings!.periodsPerGame == 4) {
					this.currentGame!.awayPointsQ3 -= 2;
				} else if (play.period == 4) {
					this.currentGame!.awayPointsQ4 -= 2;
				} else if (play.period == 5) {
					this.currentGame!.awayPointsOT -= 2;
				}
				this.currentGame!.awayFinal -= 2;
			}
			await this.updateGame();
		} else if (play.action == GameActions.ShotMissed) {
			let stat = await this.getStat(this.getPlayer(play)!.playerId);
			stat.fieldGoalsAttempted--;
			await this.saveStat(stat);
		} else if (play.action == GameActions.Steal) {
			let stat = await this.getStat(this.getPlayer(play)!.playerId);
			stat.steals--;
			await this.saveStat(stat);
		} else if (play.action == GameActions.ThreeMade) {
			let player = this.getPlayer(play)!;
			let stat = await this.getStat(player.playerId);
			stat.threesMade--;
			stat.threesAttempted--;
			await this.saveStat(stat);
			if (player.team == this.currentGame!.homeTeam) {
				if (play.period == 1) {
					this.currentGame!.homePointsQ1 -= 3;
				} else if (play.period == 2) {
					this.currentGame!.homePointsQ2 -= 3;
				} else if (play.period == 3 && this.gameCastSettings!.periodsPerGame == 2) {
					this.currentGame!.homePointsOT -= 3;
				} else if (play.period == 3 && this.gameCastSettings!.periodsPerGame == 4) {
					this.currentGame!.homePointsQ3 -= 3;
				} else if (play.period == 4) {
					this.currentGame!.homePointsQ4 -= 3;
				} else if (play.period == 5) {
					this.currentGame!.homePointsOT -= 3;
				}
				this.currentGame!.homeFinal -= 3;
			} else {
				if (play.period == 1) {
					this.currentGame!.awayPointsQ1 -= 3;
				} else if (play.period == 2) {
					this.currentGame!.awayPointsQ2 -= 3;
				} else if (play.period == 3 && this.gameCastSettings!.periodsPerGame == 2) {
					this.currentGame!.awayPointsOT -= 3;
				} else if (play.period == 3 && this.gameCastSettings!.periodsPerGame == 4) {
					this.currentGame!.awayPointsQ3 -= 3;
				} else if (play.period == 4) {
					this.currentGame!.awayPointsQ4 -= 3;
				} else if (play.period == 5) {
					this.currentGame!.awayPointsOT -= 3;
				}
				this.currentGame!.awayFinal -= 3;
			}
			await this.updateGame();
		} else if (play.action == GameActions.ThreeMissed) {
			let stat = await this.getStat(this.getPlayer(play)!.playerId);
			stat.threesAttempted--;
			await this.saveStat(stat);
		} else if (play.action == GameActions.Turnover) {
			let stat = await this.getStat(this.getPlayer(play)!.playerId);
			stat.turnovers--;
			await this.saveStat(stat);
		}
	}

	public async redoAction(play:Play) {
		if (play.action == GameActions.Assist) {
			let stat = await this.getStat(this.getPlayer(play)!.playerId);
			stat.assists++;
			await this.saveStat(stat);
		} else if (play.action == GameActions.Block) {
			let stat = await this.getStat(this.getPlayer(play)!.playerId);
			stat.blocks++;
			await this.saveStat(stat);
		} else if (play.action == GameActions.DefRebound) {
			let stat = await this.getStat(this.getPlayer(play)!.playerId);
			stat.defensiveRebounds++;
			await this.saveStat(stat);
		} else if (play.action == GameActions.Foul) {
			let player = this.getPlayer(play)!;
			let stat = await this.getStat(player.playerId);
			stat.fouls++;
			await this.saveStat(stat);
			if (player.team == this.currentGame!.homeTeam) {
				this.gameCastSettings!.homeCurrentFouls!++;
				await this.updateGameCastSetting();
			} else {
				this.gameCastSettings!.awayCurrentFouls!++;
				await this.updateGameCastSetting();
			}
		} else if (play.action == GameActions.FreeThrowMade) {
			let player = this.getPlayer(play)!;
			let stat = await this.getStat(player.playerId);
			stat.freeThrowsMade++;
			stat.freeThrowsAttempted++;
			await this.saveStat(stat);
			if (player.team == this.currentGame!.homeTeam) {
				if (play.period == 1) {
					this.currentGame!.homePointsQ1++;
				} else if (play.period == 2) {
					this.currentGame!.homePointsQ2++;
				} else if (play.period == 3 && this.gameCastSettings!.periodsPerGame == 2) {
					this.currentGame!.homePointsOT++;
				} else if (play.period == 3 && this.gameCastSettings!.periodsPerGame == 4) {
					this.currentGame!.homePointsQ3++;
				} else if (play.period == 4) {
					this.currentGame!.homePointsQ4++;
				} else if (play.period == 5) {
					this.currentGame!.homePointsOT++;
				}
				this.currentGame!.homeFinal++;
			} else {
				if (play.period == 1) {
					this.currentGame!.awayPointsQ1++;
				} else if (play.period == 2) {
					this.currentGame!.awayPointsQ2++;
				} else if (play.period == 3 && this.gameCastSettings!.periodsPerGame == 2) {
					this.currentGame!.awayPointsOT++;
				} else if (play.period == 3 && this.gameCastSettings!.periodsPerGame == 4) {
					this.currentGame!.awayPointsQ3++;
				} else if (play.period == 4) {
					this.currentGame!.awayPointsQ4++;
				} else if (play.period == 5) {
					this.currentGame!.awayPointsOT++;
				}
				this.currentGame!.awayFinal++;
			}
			await this.updateGame();
		} else if (play.action == GameActions.FreeThrowMissed) {
			let stat = await this.getStat(this.getPlayer(play)!.playerId);
			stat.freeThrowsAttempted++;
			await this.saveStat(stat);
		} else if (play.action == GameActions.FullTO) {
			if (play.teamName == this.currentGame!.homeTeam) {
				this.currentGame!.homeTeamTOL--;
				this.gameCastSettings!.homeFullTOL!--;
			} else {
				this.currentGame!.awayTeamTOL--;
				this.gameCastSettings!.awayFullTOL!--;
			}
			await this.updateGame();
			await this.updateGameCastSetting();
		} else if (play.action == GameActions.OffRebound) {
			let stat = await this.getStat(this.getPlayer(play)!.playerId);
			stat.offensiveRebounds++;
			await this.saveStat(stat);
		} else if (play.action == GameActions.PartialTO) {
			if (play.teamName == this.currentGame!.homeTeam) {
				this.currentGame!.homeTeamTOL--;
				this.gameCastSettings!.homePartialTOL!--;
			} else {
				this.currentGame!.awayTeamTOL--;
				this.gameCastSettings!.awayPartialTOL!--;
			}
			await this.updateGame();
			await this.updateGameCastSetting();
		} else if (play.action == GameActions.ShotMade) {
			let player = this.getPlayer(play)!;
			let stat = await this.getStat(player.playerId);
			stat.fieldGoalsMade++;
			stat.fieldGoalsAttempted++;
			await this.saveStat(stat);
			if (player.team == this.currentGame!.homeTeam) {
				if (play.period == 1) {
					this.currentGame!.homePointsQ1 += 2;
				} else if (play.period == 2) {
					this.currentGame!.homePointsQ2 += 2;
				} else if (play.period == 3 && this.gameCastSettings!.periodsPerGame == 2) {
					this.currentGame!.homePointsOT += 2;
				} else if (play.period == 3 && this.gameCastSettings!.periodsPerGame == 4) {
					this.currentGame!.homePointsQ3 += 2;
				} else if (play.period == 4) {
					this.currentGame!.homePointsQ4 += 2;
				} else if (play.period == 5) {
					this.currentGame!.homePointsOT += 2;
				}
				this.currentGame!.homeFinal += 2;
			} else {
				if (play.period == 1) {
					this.currentGame!.awayPointsQ1 += 2;
				} else if (play.period == 2) {
					this.currentGame!.awayPointsQ2 += 2;
				} else if (play.period == 3 && this.gameCastSettings!.periodsPerGame == 2) {
					this.currentGame!.awayPointsOT += 2;
				} else if (play.period == 3 && this.gameCastSettings!.periodsPerGame == 4) {
					this.currentGame!.awayPointsQ3 += 2;
				} else if (play.period == 4) {
					this.currentGame!.awayPointsQ4 += 2;
				} else if (play.period == 5) {
					this.currentGame!.awayPointsOT += 2;
				}
				this.currentGame!.awayFinal += 2;
			}
			await this.updateGame();
		} else if (play.action == GameActions.ShotMissed) {
			let stat = await this.getStat(this.getPlayer(play)!.playerId);
			stat.fieldGoalsAttempted++;
			await this.saveStat(stat);
		} else if (play.action == GameActions.Steal) {
			let stat = await this.getStat(this.getPlayer(play)!.playerId);
			stat.steals++;
			await this.saveStat(stat);
		} else if (play.action == GameActions.ThreeMade) {
			let player = this.getPlayer(play)!;
			let stat = await this.getStat(player.playerId);
			stat.threesMade++;
			stat.threesAttempted++;
			await this.saveStat(stat);
			if (player.team == this.currentGame!.homeTeam) {
				if (play.period == 1) {
					this.currentGame!.homePointsQ1 += 3;
				} else if (play.period == 2) {
					this.currentGame!.homePointsQ2 += 3;
				} else if (play.period == 3 && this.gameCastSettings!.periodsPerGame == 2) {
					this.currentGame!.homePointsOT += 3;
				} else if (play.period == 3 && this.gameCastSettings!.periodsPerGame == 4) {
					this.currentGame!.homePointsQ3 += 3;
				} else if (play.period == 4) {
					this.currentGame!.homePointsQ4 += 3;
				} else if (play.period == 5) {
					this.currentGame!.homePointsOT += 3;
				}
				this.currentGame!.homeFinal += 3;
			} else {
				if (play.period == 1) {
					this.currentGame!.awayPointsQ1 += 3;
				} else if (play.period == 2) {
					this.currentGame!.awayPointsQ2 += 3;
				} else if (play.period == 3 && this.gameCastSettings!.periodsPerGame == 2) {
					this.currentGame!.awayPointsOT += 3;
				} else if (play.period == 3 && this.gameCastSettings!.periodsPerGame == 4) {
					this.currentGame!.awayPointsQ3 += 3;
				} else if (play.period == 4) {
					this.currentGame!.awayPointsQ4 += 3;
				} else if (play.period == 5) {
					this.currentGame!.awayPointsOT += 3;
				}
				this.currentGame!.awayFinal += 3;
			}
			await this.updateGame();
		} else if (play.action == GameActions.ThreeMissed) {
			let stat = await this.getStat(this.getPlayer(play)!.playerId);
			stat.threesAttempted++;
			await this.saveStat(stat);
		} else if (play.action == GameActions.Turnover) {
			let stat = await this.getStat(this.getPlayer(play)!.playerId);
			stat.turnovers++;
			await this.saveStat(stat);
		}
	}

	public async updatePlay(play: Play) {
		let prevPlay = this.prevPlays!.find(t => t.playId == play.playId)!;
		if (prevPlay.teamName != play.teamName && play.playerName != null) {
			if (play.teamName == this.currentGame!.homeTeam) {
				play.playerName = this.homeTeamPlayers![0].firstName + ' ' + this.homeTeamPlayers![0].lastName;
				play.playerNumber = this.homeTeamPlayers![0].number;
			} else {
				play.playerName = this.awayTeamPlayers![0].firstName + ' ' + this.awayTeamPlayers![0].lastName;
				play.playerNumber = this.awayTeamPlayers![0].number;
			}
		}
		await this.undoAction(prevPlay);
		await this.redoAction(play);
		play.score = `${this.currentGame!.homeFinal} - ${this.currentGame!.awayFinal}`;
		if (!this.sync.online) {
			play.syncState = SyncState.Modified;
		}
		await this.crud.save('plays', play, { "playId": `${play.playId}`,"gameId": `'${this.gameId}'` });
		await this.setPrevPlays();
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
		this.homeTeamPlusOrMinus = this.currentGame!.homeFinal;
		this.awayTeamPlusOrMinus = this.currentGame!.awayFinal;
		if (this.currentGame!.clock == "00:00") {
			if (this.currentGame!.period < this.gameCastSettings!.periodsPerGame!)
				this.timerDuration = this.gameCastSettings!.minutesPerPeriod! * 60;
			else
				this.timerDuration = this.gameCastSettings!.minutesPerOvertime! * 60;
			this.currentGame!.period++;
			this.resetTOs();
		} else {
			let times = this.currentGame!.clock.split(':');
			this.timerDuration = Number(times[0].startsWith('0') ? times[0].charAt(1) : times[0]) * 60 + Number(times[1].startsWith('0') ? times[1].charAt(1) : times[1]);
		}
    this.timerRunning = true;
    this.timerSubscription = interval(1000).subscribe(() => {
      if (this.timerDuration > 0) {
        this.timerDuration--;
        this.updateTimerDisplay();
      } else {
        this.stopTimer();
      }
    });
  }

	async resetTOs() {
		if (this.gameCastSettings!.resetTimeoutsEveryPeriod == 1) {
			this.gameCastSettings!.homeFullTOL = this.gameCastSettings!.fullTimeouts;
			this.gameCastSettings!.awayFullTOL = this.gameCastSettings!.fullTimeouts;
			this.gameCastSettings!.homePartialTOL = this.gameCastSettings!.partialTimeouts;
			this.gameCastSettings!.awayPartialTOL = this.gameCastSettings!.partialTimeouts;
			await this.updateGameCastSetting();
		}
	}

  async stopTimer() {
    this.timerRunning = false;
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
		if (this.homeTeamPlusOrMinus != 0 || this.awayTeamPlusOrMinus != 0) {
			let homePlusOrMinusToAdd = (this.currentGame!.homeFinal - this.homeTeamPlusOrMinus) - (this.currentGame!.awayFinal - this.awayTeamPlusOrMinus);
			let awayPlusOrMinusToAdd = (this.currentGame!.awayFinal - this.awayTeamPlusOrMinus) - (this.currentGame!.homeFinal - this.homeTeamPlusOrMinus);
			let homePlayers = this.homePlayersOnCourt.slice(0);
			let awayPlayers = this.awayPlayersOnCourt.slice(0);
			for (let item of homePlayers) {
				let stat = await this.getStat(item.playerId);
				stat.plusOrMinus += homePlusOrMinusToAdd;
				await this.saveStat(stat);
			}
			for (let item of awayPlayers) {
				let stat = await this.getStat(item.playerId);
				stat.plusOrMinus += awayPlusOrMinusToAdd;
				await this.saveStat(stat);
			}
			this.homeTeamPlusOrMinus = 0;
			this.awayTeamPlusOrMinus = 0;
		}
  }

	async changePeriod() {
		await this.updateGame();
		await this.resetTOs();
	}

  updateTimerDisplay() {
    const minutes = Math.floor(this.timerDuration / 60);
    const seconds = this.timerDuration % 60;
    this.currentGame!.clock = `${minutes < 10 ? '0' + minutes : minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
  }

  async ngOnDestroy() {
		this.initSub?.unsubscribe();
    await this.stopTimer();
		clearInterval(this.interval);
		await this.send();
		this.sync.gameCastInProgress = false;
  }

}

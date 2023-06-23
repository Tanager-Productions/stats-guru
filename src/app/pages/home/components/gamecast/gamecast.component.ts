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
import { ColDef, GridApi, SelectionChangedEvent, ValueFormatterParams } from 'ag-grid-community';

//teamName | player name | player number | GameAction | period | gameClock | score | timestamp

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
	plays?: Play[];
	homeTeamFouls: number = 0;
	awayTeamFouls:number = 0;
  timerSubscription?: Subscription;
  timerDuration: number = 8 * 60;
  timeLeft: number = this.timerDuration;
  timerDisplay: string = '08:00';
  timerRunning: boolean = false;
	newPlayerNumber:string = '';
	homePlayerSelected: number = 0;
	editPlayer:boolean = false;

	public teamStats: ColDef[] = [
		{field: 'firstName', headerName: 'First Name'},
		{field: 'lastName', headerName: 'Last Name'},
		{field: 'minutes', headerName: 'MIN', width: 80},
		{field: 'rebounds', headerName: 'REB', width: 80},
		{field: 'defensiveRebounds', headerName: 'DREB', width: 90},
		{field: 'offensiveRebounds', headerName: 'OREB', width: 90},
		{field: 'fieldGoalsMade', headerName: 'FGM', width: 80},
		{field: 'fieldGoalsAttempted', headerName: 'FGA', width: 80},
		{field: 'blocks', headerName: 'BLK', width: 80},
		{field: 'steals', headerName: 'STL', width: 80},
		{field: 'threesMade', headerName: '3FGM', width: 90},
		{field: 'threesAttempted', headerName: '3FGA', width: 90},
		{field: 'freeThrowsMade', headerName: 'FTM', width: 80},
		{field: 'freeThrowsAttempted', headerName: 'FTA', width: 80},
		{field: 'points', headerName: 'PTS', width: 80},
		{field: 'turnovers', headerName: 'TO', width: 80},
		{field: 'fouls', headerName: 'FLS', width: 80},
		{field: 'plusOrMinus', headerName: '+/-', width: 80},
		{field: 'eff', headerName: 'EFF'}
	];

  constructor(private route: ActivatedRoute, private crud: CrudService, private sql: SqlService) {}

  ngOnInit() {
    this.route.params.subscribe((params: { [x: string]: string | number }) => {
      this.gameId = params['gameId'] as number;
			this.fetchData();
    });
  }

	private async fetchData() {
		this.db = await this.sql.createConnection();
		this.currentGame = (await this.crud.rawQuery(this.db, `
			SELECT 	*
			FROM 		Games
			WHERE 	gameId = ${this.gameId}
		`))[0];
    this.homeTeamPlayers = await this.crud.rawQuery(this.db, `
			SELECT 	*
			FROM 		Players
			WHERE 	team = '${this.currentGame?.homeTeam}'
			AND 		isMale = ${this.currentGame?.isMale};
		`);
    this.awayTeamPlayers = await this.crud.rawQuery(this.db, `
			SELECT 	*
			FROM 		Players
			WHERE 	team = '${this.currentGame?.awayTeam}'
			AND 		isMale = ${this.currentGame?.isMale};
		`);
		this.stats = await this.crud.rawQuery(this.db, `
			SELECT	*
			FROM 		Stats
			WHERE 	game = ${this.gameId};
		`);
		this.homeTeamStats = await this.crud.rawQuery(this.db, `
			SELECT			Players.firstName, Players.lastName, Stats.minutes, Stats.rebounds, Stats.defensiveRebounds,
									Stats.offensiveRebounds, Stats.fieldGoalsMade, Stats.fieldGoalsAttempted, Stats.blocks, Stats.steals, Stats.threesMade,
									Stats.threesAttempted, Stats.freeThrowsMade, Stats.freeThrowsAttempted, Stats.points, Stats.turnOvers,
									Stats.fouls, Stats.plusOrMinus, Stats.eff
			FROM				Stats
			INNER JOIN	Players ON Stats.player = Players.playerId
			WHERE 			team = '${this.currentGame?.homeTeam}'
		`)
		this.awayTeamStats = await this.crud.rawQuery(this.db, `
			SELECT			Players.firstName, Players.lastName, Stats.minutes, Stats.rebounds, Stats.defensiveRebounds,
									Stats.offensiveRebounds, Stats.fieldGoalsMade, Stats.fieldGoalsAttempted, Stats.blocks, Stats.steals, Stats.threesMade,
									Stats.threesAttempted, Stats.freeThrowsMade, Stats.freeThrowsAttempted, Stats.points, Stats.turnOvers,
									Stats.fouls, Stats.plusOrMinus, Stats.eff
			FROM				Stats
			INNER JOIN	Players ON Stats.player = Players.playerId
			WHERE 			team = '${this.currentGame?.awayTeam}'
		`)
		this.plays = await this.crud.rawQuery(this.db, `
			SELECT 		*
			FROM 			Plays
			WHERE 		gameId = ${this.gameId}
			ORDER BY	playId DESC
		`);
		let homePlayerIds = this.awayTeamPlayers.map(t => t.playerId);
		let awayPlayerIds = this.homeTeamPlayers.map(t => t.playerId);
		this.homeTeamFouls = this.stats.filter(t => homePlayerIds.includes(t.player)).reduce((sum, current) => sum + current.fouls, 0);
		this.awayTeamFouls = this.stats.filter(t => awayPlayerIds.includes(t.player)).reduce((sum, current) => sum + current.fouls, 0);
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

  addToTeam(team: 'home' | 'away') {
    let newTeamPlayer: Player = {
      playerId: 0,
      firstName: "New",
      lastName: "Player",
      number: Number(this.newPlayerNumber),
      position: "",
      team: team == 'home' ? this.currentGame!.homeTeam : this.currentGame!.awayTeam,
      picture: null,
      isMale: this.currentGame!.isMale!,
      syncState: SyncState.Unchanged
    }

		if (team == 'home') {
			this.homeTeamPlayers!.push(newTeamPlayer);
		} else {
			this.awayTeamPlayers!.push(newTeamPlayer);
		}

    this.clearNumberInput();
  }

  addToHomeCourt (player: Player) {
    if(this.homePlayersOnCourt.length < 5) {
      this.homePlayersOnCourt.push(player);
			this.homeTeamPlayers!.splice(this.homeTeamPlayers!.indexOf(player), 1)
    }
  }

  addToAwayCourt (player: Player) {
    if (this.awayPlayersOnCourt.length < 5) {
      this.awayPlayersOnCourt.push(player);
			this.awayTeamPlayers!.splice(this.awayTeamPlayers!.indexOf(player), 1)
    }
  }

  removeFromHomeCourt (player: Player) {
    this.homePlayersOnCourt.splice(this.homePlayersOnCourt.indexOf(player), 1);
  }

  removeFromAwayCourt (player: Player) {
    this.awayPlayersOnCourt.splice(this.awayPlayersOnCourt.indexOf(player), 1);
  }

  addPoints(team: 'home' | 'away', points: number) {

  }

  addFoul(team: 'home' | 'away') {

  }

  useTimeout(team: 'home' | 'away', partial: boolean = false) {

  }

	addSteal(team: 'home' | 'away') {

	}

  nextPeriod(direction: 'left' | 'right') {
		let period = Number(this.currentGame!.period);
		if (direction == 'right') {
			if (period < 5) {
				period++;
				this.currentGame!.period = String(period);
				this.updateGame();
			}
		}
		if (direction == 'left') {
			if (period > 1) {
				period --;
				this.currentGame!.period = String(period);
				this.updateGame();
			}
		}
  }

	private async updateGame() {
		this.currentGame!.syncState = SyncState.Modified;
		await this.crud.save(this.db, 'Games', this.currentGame, { "gameId": `${this.gameId}` });
	}

  startStopTimer(timerRunning: boolean) {
    if (timerRunning == true) {
      this.stopTimer();
    } else {
      this.startTimer();
    }
  }

	updateTimer (direction: 'left' | 'right') {
		if (this.timerRunning == false) {
			if (direction == 'left') {
				if (this.timeLeft > 0) {
					this.timeLeft--;
					this.updateTimerDisplay();
					console.log(this.timeLeft);
				}
			}
			if (direction == 'right') {
				if (this.timeLeft < this.timerDuration) {
					this.timeLeft++;
					this.updateTimerDisplay();
					console.log(this.timeLeft);
				}
			}
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
    this.timerDisplay = `${minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
  }

  ngOnDestroy() {
    this.stopTimer();
  }


  resetGame() {
    this.stopTimer();
    this.timeLeft = this.timerDuration;
    this.updateTimerDisplay();
    //this.homeTeamScore = 0;
    //this.awayTeamScore = 0;
    //this.homeTeamFouls = 0;
    //this.awayTeamFouls = 0;
    //this.homeTeamSteals = 0;
    //this.awayTeamSteals = 0;
    //this.homeTeamTOL = 5;
    //this.awayTeamTOL = 5;
    //this.period = 1;
  }

}

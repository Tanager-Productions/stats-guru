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
	editPlayer: boolean = false;

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

	editPlayerNameNumber(edit: boolean) {
		//this.editPlayer = edit;
	}

	updatePlayerNameNumber(firstName: string, lastName: string, number: number, teamName: string) {
		let updatedTeamPlayer: Player = {
      playerId: 0,
      firstName: firstName,
      lastName: lastName,
      number: number,
      position: "",
      team: teamName,
      picture: null,
      isMale: "",
      syncState: SyncState.Unchanged
    }
		return updatedTeamPlayer;
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
    }
  }

  addToAwayCourt (player: Player) {
    if (this.awayPlayersOnCourt.length < 5) {
      this.awayPlayersOnCourt.push(player);
    }
  }

  removeFromHomeCourt (player: Player) {
		this.homePlayerSelected = 0;
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

  nextPeriod() {
		let period = Number(this.currentGame!.period);
    if (period < 4) {
      period++;
			this.currentGame!.period = String(period);
			this.updateGame();
    }
  }

	private async updateGame() {
		await this.crud.save(this.db, 'Games', this.currentGame, { "gameId": `${this.gameId}` });
	}

  startStopTimer(timerRunning: boolean) {
    if (timerRunning == true) {
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

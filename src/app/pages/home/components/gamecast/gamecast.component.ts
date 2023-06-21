import { Component } from '@angular/core';
import {NgFor} from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Observable, Subscription, async, interval, map } from 'rxjs';
import { Game } from 'src/app/interfaces/game.interface';
import { Player } from 'src/app/interfaces/player.interface';
import { Team } from 'src/app/interfaces/team.interface';
import { CommonService } from 'src/app/services/common/common.service';
import { CrudService } from 'src/app/services/crud/crud.service';
import { SqlService } from 'src/app/services/sql/sql.service';
import {
  CdkDragDrop,
  moveItemInArray,
  transferArrayItem,
  CdkDrag,
  CdkDropList
} from '@angular/cdk/drag-drop';
import { SyncState } from 'src/app/interfaces/syncState.enum';

@Component({
  selector: 'app-gamecast',
  templateUrl: './gamecast.component.html',
  styleUrls: ['./gamecast.component.scss'],
})
export class GamecastComponent {
	public ro:boolean = true;
  public games$?: Observable<Game[]>;
  gameId: number | undefined;
  currentGame$?: Observable<Game | undefined>;
  homeTeamScore: number = 0;
  awayTeamScore: number = 0;
  homeTeamFouls: number = 0;
  homeTeamSteals: number = 0;
  awayTeamSteals: number = 0;
  timerSubscription?: Subscription;
  awayTeamFouls: number = 0;
  homeTeamTOL: number = 5;
  awayTeamTOL: number = 5;
  period: number = 1;
  timerDuration: number = 40 * 60;
  timeLeft: number = this.timerDuration;
  timerDisplay: string = '00:00';
  timerRunning: boolean = false;
  homeTeam!: Team;
  awayTeam!: Team;
  players$?: Observable<Player[]> | undefined;
  currentPlayers$?: Observable<Player | undefined>;
  homeTeamPlayers: Player[] = [];
  awayTeamPlayers: Player[] = [];
  homeTeamPlayersOnCourt: Player[] = [];
  awayTeamPlayersOnCourt: Player[] = [];
  teams: Team[] = [];
  players: Player[] = [];
  newPlayerNumber: number[] = [];
  playerNumber!: number;

  constructor(
    private route: ActivatedRoute,
    private common: CommonService,
    private crud: CrudService,
    private sql: SqlService
    ) {}

  ngOnInit() {
    this.route.params.subscribe((params: { [x: string]: string | number;}) => {
      this.gameId = +params['gameId'];
      this.games$ = this.common.getGames();
      this.common.getTeams().subscribe(teams => this.teams = teams);
      this.common.getPlayers().subscribe(players => this.players = players);
      if (this.games$) {
        this.currentGame$ = this.games$.pipe(
          map(games => games.find(game => game.gameId === this.gameId))
        );
      }
    });

    this.fetchPlayersUsingQuery();
  }

  inputNumber (numberClicked: number) {
    if (this.newPlayerNumber.length < 3) {
      this.newPlayerNumber.push(numberClicked);
    }
  }

  clearNumberInput() {
    this.newPlayerNumber.length = 0;
  }

  clockPlayer() {
    this.playerNumber = Number(this.newPlayerNumber.join(''));
    this.newPlayerNumber.length = 0;
    console.log(this.playerNumber);

  }

  addToHomeTeam(teamName: string) {
    this.playerNumber = Number(this.newPlayerNumber.join(''));
    this.newPlayerNumber.length = 0;
    let newTeamPlayer: Player = {
      playerId: 0,
      firstName: "",
      lastName: "",
      number: this.playerNumber,
      position: "",
      team: teamName,
      picture: null,
      isMale: "",
      syncState: SyncState.Unchanged
    }
    console.log(this.playerNumber);
    this.homeTeamPlayers.push(newTeamPlayer);
    console.log(this.homeTeamPlayers);
    this.playerNumber = 0;
  }

  addToAwayTeam(teamName: string) {
    this.playerNumber = Number(this.newPlayerNumber.join(''));
    this.newPlayerNumber.length = 0;
    let newTeamPlayer: Player = {
      playerId: 0,
      firstName: "",
      lastName: "",
      number: this.playerNumber,
      position: "",
      team: teamName,
      picture: null,
      isMale: "",
      syncState: SyncState.Unchanged
    }
    console.log(this.playerNumber);
    this.awayTeamPlayers.push(newTeamPlayer);
    console.log(this.awayTeamPlayers);
    this.playerNumber = 0;
  }

  addToHomeCourt (player: Player) {
    if(this.homeTeamPlayersOnCourt.length < 5) {
      this.homeTeamPlayersOnCourt.push(player);
      this.homeTeamPlayers.splice(this.homeTeamPlayers.indexOf(player), 1);
    }
  }

  addToAwayCourt (player: Player) {
    if (this.awayTeamPlayersOnCourt.length < 5) {
      this.awayTeamPlayersOnCourt.push(player);
      this.awayTeamPlayers.splice(this.awayTeamPlayers.indexOf(player), 1);
    }
  }

  removeFromHomeCourt (player: Player) {
    this.homeTeamPlayers.push(player);
    this.homeTeamPlayersOnCourt.splice(this.homeTeamPlayersOnCourt.indexOf(player), 1);
  }

  removeFromAwayCourt (player: Player) {
    this.awayTeamPlayers.push(player);
    this.awayTeamPlayersOnCourt.splice(this.awayTeamPlayersOnCourt.indexOf(player), 1);
  }

  public async fetchPlayersUsingQuery() {
    let db = await this.sql.createConnection();
    let teams = await this.crud.rawQuery(db, `select Games.homeTeam, Games.awayTeam from Games where gameId = ${this.gameId};`);
    let playersForTeam1: Player[] = await this.crud.query(db, "players", true, {"team": `'${teams[0].homeTeam}'`, "isMale": "true"});
    let playersForTeam2: Player[] = await this.crud.query(db, "players", true, {"team": `'${teams[0].awayTeam}'`, "isMale": "true"});
    this.homeTeamPlayers = playersForTeam1;
    this.awayTeamPlayers = playersForTeam2;
    console.log(this.homeTeamPlayers);
  }

  addPoints(team: string, points: number) {
    if (team === 'home') {
      this.homeTeamScore += points;
    } else {
      this.awayTeamScore += points;
    }
  }

  addFoul(team: string) {
    if (team === 'home') {
      this.homeTeamFouls++;
    } else {
      this.awayTeamFouls++;
    }
  }

  addSteal (team: string) {
    if (team == 'home') {
      this.homeTeamSteals++;
    } else {
      this.awayTeamSteals++;
    }
  }

  useTimeout(team: string, duration: number) {
    if (team == 'home' && this.homeTeamTOL > 0) {
      this.homeTeamTOL--;
    } else if (team === 'away' && this.awayTeamTOL > 0) {
      this.awayTeamTOL--;
    }
  }

  nextPeriod() {
    if (this.period < 4)
    {
      this.period++;
    }
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
    this.homeTeamScore = 0;
    this.awayTeamScore = 0;
    this.homeTeamFouls = 0;
    this.awayTeamFouls = 0;
    this.homeTeamSteals = 0;
    this.awayTeamSteals = 0;
    this.homeTeamTOL = 5;
    this.awayTeamTOL = 5;
    this.period = 1;
  }

}

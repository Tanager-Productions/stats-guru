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

@Component({
  selector: 'app-gamecast',
  templateUrl: './gamecast.component.html',
  styleUrls: ['./gamecast.component.scss'],
})
export class GamecastComponent {
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
  timerDisplay: string = '';
  timerRunning: boolean = false;
  homeTeam: Team | undefined;
  awayTeam: Team | undefined;
  players$?: Observable<Player[]> | undefined;
  currentPlayers$?: Observable<Player | undefined>;
  homeTeamPlayers: Player[] = [];
  awayTeamPlayers: Player[] = [];
  teams: Team[] = [];
  players: Player[] = [];
  playerId: number | undefined;
  team: string | undefined;
  number: number = 0;
  teamMemberNumbers: number[] = [];
  awayTeamNumbers: number[] = [];
  teamPlayers: any[] = [];

  constructor(
    private route: ActivatedRoute, 
    private common: CommonService,
    private crud: CrudService, 
    private sql: SqlService
    ) {}

  homeTeamMembers = [1, 4, 6, 45, 66, 76, 89, 99, 14, 5, 7, 3, 44, 2, 77];

  awayTeamMembers = [4, 56, 7, 4, 3, 2, 1, 10, 33, 45, 66, 34, 3, 23, 49];

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

  drop(event: CdkDragDrop<any[]>) {
    moveItemInArray(this.homeTeamMembers, event.previousIndex, event.currentIndex);
    moveItemInArray(this.awayTeamMembers, event.previousIndex, event.currentIndex);
  }

  getTeamPlayers(name: string) {
    this.teamPlayers = this.players.filter(function(currentPlayers) {
      return currentPlayers.team == name && currentPlayers.isMale == "1";
    })
    for (const player of this.teamPlayers) {
      this.teamMemberNumbers.push(player.number);
    }
    console.log(this.teamMemberNumbers);
    return (this.teamMemberNumbers);
  }

  public async fetchPlayersUsingQuery() {
    let db = await this.sql.createConnection();
    let playersForTeam1: Player[] = await this.crud.query(db, "players", true, {"team": "home", "isMale": "true"});
    let playersForTeam2: Player[] = await this.crud.query(db, "players", true, {"team": "away", "isMale": "true"});
    this.homeTeamPlayers = playersForTeam1;
    this.awayTeamPlayers = playersForTeam2;
    console.log(this.homeTeamPlayers);
    await db.close();
  }

  public async fetchPlayersUsingRawSql() {
    let db = await this.sql.createConnection();
    //it gives you back an array of type any
    let playersForBothTeams: any[] = await this.crud.rawQuery(db, "Select * from players where team = 'home' or team = 'away'");
    //you can manually cast it to players, but if your query doesn't match up with what you cast it to then javascript will 
    //dynamically change the type at runtime and you could possibly run into errors when using the values
    let playersForBothTeamsCasted: Player[] = await this.crud.rawQuery(db, "Select * from players where (team = 'home' or team = 'away') and isMale = 'true'");
    await db.close();
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
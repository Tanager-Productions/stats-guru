import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, Subscription, interval, map } from 'rxjs';
import { Game } from 'src/app/interfaces/game.interface';
import { Player } from 'src/app/interfaces/player.interface';
import { Team } from 'src/app/interfaces/team.interface';
import { CommonService } from 'src/app/services/common/common.service';

@Component({
  selector: 'app-gamecast',
  templateUrl: './gamecast.component.html',
  styleUrls: ['./gamecast.component.scss']
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
  players$: Observable<Player[]> | undefined;
  currentPlayers$?: Observable<Player | undefined>;
  homeTeamPlayers: Player[] = [];
  awayTeamPlayers: Player[] = [];
  teams: Team[] = [];
  players: Player[] = [];
  playerId: number | undefined;
  team: string | undefined;

  constructor(
    private route: ActivatedRoute, 
    private common: CommonService
    ) {}

  ngOnInit() {
    this.route.params.subscribe((params: { [x: string]: string | number; }) => {
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
  }

  getHomeTeamPlayers() {
    this.homeTeamPlayers
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